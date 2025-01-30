from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_cors import CORS,cross_origin
from flask_session import Session
import os
import pandas as pd
import io
from neo4j.graph import Node
import threading
import logging
from logging.handlers import RotatingFileHandler
import os
import uuid
from utils.neo4j_connector import Neo4jConnector
import re
import time
import json



app = Flask(__name__)
#global_constraints = ["MATCH (a:Character)-[p:PILOT {deleted:false}]->(b:Starship)-[r:APPEARED_IN {deleted:false}] ->(c:Film) WHERE not (a)-[:APPEARED_IN {deleted:false}]->(c) Return [id(a),id(b),id(c)] as node_ids, [id(r),id(p)] as rel_ids","MATCH (a:Character)-[p:PILOT {deleted:false}]->(b:Vehicle)-[r:APPEARED_IN {deleted:false}] ->(c:Film) WHERE not (a)-[:APPEARED_IN {deleted:false}]->(c) Return [id(a),id(b),id(c)] as node_ids, [id(r),id(p)] as rel_ids","MATCH (a:Species)<-[p:OF {deleted:false}]-(b:Character)-[r:PILOT {deleted:false}]->(c:Starship) WHERE a.average_height>c.height Return [id(a),id(b),id(c)] as node_ids, [id(r),id(p)] as rel_ids"]
global_constraints = {}
app.secret_key = 'supersecretkey'  # For session management, change this for production
neo4jConnector = Neo4jConnector()
app.config['SESSION_TYPE'] = 'filesystem'

Session(app)



# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Enable CORS for HTTP requests
CORS(app, origins=["*"])


# Store users and constraints in memory for simplicity
users = []
constraints = []
tasks = {}

def process_csv_task(file_content):
    # Simulate CSV processing by reading the file content
    data = pd.read_csv(io.StringIO(file_content.decode('utf-8')), dtype=str, sep=";", 
                                     index_col=False, header=0,
                                     low_memory=False, engine='c', compression='infer', 
                                     )
    
    
    
    neo4jConnector.clearNeo4j()
    neo4jConnector.load_csv(data)
    schema = neo4jConnector.getSchema()
    return schema



def detect_violation(task_id, constraints):
    neo4jConnector.query("MATCH (a)-[r]->(b) SET r.deleted=False")
    violations = {}
    for constraint in constraints : 
            produced_violations = neo4jConnector.query(constraint['constraints'])
            for result in produced_violations:
                n_ids = result['node_ids']
                r_ids = result['rel_ids']
                n_labels = result['node_labels']
                r_labels = result['rel_labels']
                create_violation_node_query = '''
                WITH '''+str(n_ids)+''' AS node_ids, '''+str(r_ids)+''' AS rel_ids, "'''+str(n_labels)+'''" AS node_labels, "'''+str(r_labels)+'''" AS rel_labels
                // Retrieve nodes dynamically
                CALL apoc.cypher.run(
                "MATCH (n) WHERE ID(n) IN $node_ids RETURN n", 
                {node_ids: node_ids}
                ) YIELD value 
                WITH collect(value.n) AS n, rel_ids

                // Retrieve relationships dynamically
                CALL apoc.cypher.run(
                "MATCH ()-[r]->() WHERE ID(r) IN $rel_ids RETURN r", 
                {rel_ids: rel_ids}
                ) YIELD value
                WITH n, collect(value.r) AS r

                // Extract properties
                WITH n, r, 
                    [x IN n | toString(ID(x))] AS node_ids,  
                    [x IN r | toString(ID(x))] AS rel_ids,  
                    [x IN n | labels(x)[0]] AS node_labels, 
                    [x IN r | type(x)] AS rel_types

                // Merge the Violation node
                CALL apoc.merge.node(['Violation'], 
                    {
                    solved: False, locked: False, 
                    node_ids: apoc.text.join(node_ids, ','),  
                    rel_ids: apoc.text.join(rel_ids, ','),
                    node_labels: "'''+str(n_labels)+'''",
                    rel_labels : "'''+str(r_labels)+'''",
                    labels: apoc.text.join(node_labels + rel_types, ','),
                    type: "'''+constraint['constraints']+'''",
                    atomic_repairs:"'''+constraint['queries']+'''",
                    pattern:"'''+constraint['pattern']+'''",
                    text:"'''+constraint['text']+'''",
                    repairs:"'''+constraint['repairs']+'''"
                    }, 
                    {}, 
                    {}) YIELD node AS v

                // Create BELONGS relationships
                FOREACH (x IN n | MERGE (x)-[:BELONGS]->(v))

                RETURN v, n, r
                '''
                violation = neo4jConnector.query(create_violation_node_query)
    app.logger.info(f"Finish processing constraints")
    thread = threading.Thread(target=create_grdg)
    thread.start()


def new_to_viz_json(result, neighbors):
    graph_object = {"nodes":[], "relationships":[]}
    
    unique_ids = []
    for node in result[0]:
        id = result[0][node].element_id
        if(id not in unique_ids):
            unique_ids.append(id)
            if(type(result[0][node])==Node):
                
                label = list(result[0][node].labels)[0]
                graph_object['nodes'].append({'id':id})
                properties = {}
                for l, v in result[0][node].items():
                    if(l in ["mass","height","name","model","vehicle_class","length","width","title","release_date","episode_id","average_height"]):
                        properties[l] = v
                graph_object['nodes'][-1]['title']=str(properties)
                graph_object['nodes'][-1]['label']=str(label)
                graph_object['nodes'][-1]['color']='green'
            else:
                properties = {}
                for l, v in result[0][node].items():
                    properties[l] = v
                if(not properties['deleted']):
                    nodes = result[0][node].nodes
                    id1 = nodes[0].element_id
                    id2 = nodes[1].element_id
                    types= result[0][node].type
                    graph_object['relationships'].append({'from' : id1, 'to': id2, 'title': types, 'label': types, 'id':id})
                    graph_object['relationships'][-1]['color']='green'
            
    for res in neighbors:
        for node in res:
            
            id = res[node].element_id
            if(id not in unique_ids):
                unique_ids.append(id)
                if(type(res[node])==Node):
                    label = list(res[node].labels)[0]
                    graph_object['nodes'].append({'id':id})
                    properties = {}
                    for l, v in res[node].items():
                        if(l in ["mass","height","name","model","vehicle_class","length","width","title","release_date","episode_id","average_height"]):
                            properties[l] = v
                    graph_object['nodes'][-1]['title']=str(properties)
                    graph_object['nodes'][-1]['label']=str(label)
                    graph_object['nodes'][-1]['color']='gray'
                else:
                    nodes = res[node].nodes
                    id1 = nodes[0].element_id
                    id2 = nodes[1].element_id
                    types= res[node].type
                    graph_object['relationships'].append({'from' : id1, 'to': id2, 'title': types, 'label': types})
                    graph_object['relationships'][-1]['color']='gray'
            
    return graph_object


def to_viz_json(result, neighbors):
    # nodes: nodes.map((node:any) => ({id: node.id, label: node.properties.name}))),
    # edges: edges.map((edge:any) => ({from: edge.nodes[0], to: edge.nodes[1], title : edge.type, label: edge.type})),
    graph_object = {"nodes":[], "relationships":[]}
    
    unique_ids = []
    for node in result[0]:
        id = result[0][node].element_id
        if(id not in unique_ids):
            unique_ids.append(id)
            if(type(result[0][node])==Node):
                
                label = list(result[0][node].labels)[0]
                graph_object['nodes'].append({'id':id})
                properties = {}
                for l, v in result[0][node].items():
                    if(l in ["mass","height","name","model","vehicle_class","length","width","title","release_date","episode_id","average_height"]):
                        properties[l] = v
                graph_object['nodes'][-1]['title']=str(properties)
                graph_object['nodes'][-1]['label']=str(label)
                graph_object['nodes'][-1]['color']='red'
            else:
                nodes = result[0][node].nodes
                id1 = nodes[0].element_id
                id2 = nodes[1].element_id
                types= result[0][node].type
                graph_object['relationships'].append({'from' : id1, 'to': id2, 'title': types, 'label': types, 'id':id})
                graph_object['relationships'][-1]['color']='red'
            
    for res in neighbors:
        for node in res:
            
            id = res[node].element_id
            if(id not in unique_ids):
                unique_ids.append(id)
                if(type(res[node])==Node):
                    label = list(res[node].labels)[0]
                    graph_object['nodes'].append({'id':id})
                    properties = {}
                    for l, v in res[node].items():
                        if(l in ["mass","height","name","model","vehicle_class","length","width","title","release_date","episode_id","average_height"]):
                            properties[l] = v
                    graph_object['nodes'][-1]['title']=str(properties)
                    graph_object['nodes'][-1]['label']=str(label)
                    graph_object['nodes'][-1]['color']='gray'
                else:
                    nodes = res[node].nodes
                    id1 = nodes[0].element_id
                    id2 = nodes[1].element_id
                    types= res[node].type
                    graph_object['relationships'].append({'from' : id1, 'to': id2, 'title': types, 'label': types})
                    graph_object['relationships'][-1]['color']='gray'
            
    return graph_object


def isRepair(selected_repair,selected_violation):
    
    neo4jConnector.db.begin()
    neo4jConnector.query(selected_repair)
    constraint = selected_violation['constraint']
    node_ids = [item['id'] for item in selected_violation['violation']['nodes']]
    
    filter = ""
    letters = ['a','b','c','d']
    
    for count, nid in enumerate(node_ids):
        filter += "ID("+letters[count]+") = " + nid.split(':')[-1] + " AND "
    
    test_query = constraint.replace("WHERE", "WHERE "+filter )
    
    
    new_res=neo4jConnector.query(test_query)
    if(len(new_res)==0):
        neo4jConnector.db.rollback()
        return True
    neo4jConnector.db.rollback()
    return False

def checkSafety(selected_repair,selected_violation):

    safe = True
    neo4jConnector.db.begin()
    
    neo4jConnector.query(selected_repair)
    properties = {}
    for l, v in selected_violation['v'].items():
        properties[l] = v 
    nodi =properties['nodes'].split(",")                        
    labels =properties['labels'].split(",")  
    for constraint in constraints:
        allowed_nodes = constraint['ids']
        viols =[]
        for j in range(len(nodi)):
            if('ID('+labels[j]+')' in allowed_nodes):
                filters="ID("+labels[j]+")="+nodi[j]
                vios=neo4jConnector.query(constraint['new_constraint'].replace("FILTRI",filters))   
                viols.extend(vios)                            
    for viol in viols:
        filters =""                                    
        for nodes in viol.keys():
            if(filters==""):
                filters+=nodes + "="+str(viol[nodes])
            else:
                filters+=" AND "+nodes + "="+str(viol[nodes])
        # query = self.constraints[violation_type]['constraint']
        # if(self.neo4jConnector.query(query.replace("RETURN", filters + " RETURN"))==[]):
        if(len(neo4jConnector.query(constraint['check_new_violation'].replace("FILTRI",filters)))==0):
            
            safe=False
            break
        

    neo4jConnector.db.rollback()
    return safe



def solve_additional_violations(selected_repair,selected_violation):
    solved_count = 1
    violation_id = selected_violation['violation_id']
    app.logger.info(f"Check on : {violation_id}")
    neighbors=neo4jConnector.query("MATCH (v) WHERE ID(v)="+str(violation_id)+" CALL apoc.neighbors.athop(v, 'INTERSECT', 1) YIELD node RETURN ID(node) as id, v.node_ids as nodes,v.node_labels as labels, v.pattern as type")
    app.logger.info(f"Neighbors: {neighbors}")
    for ngh in neighbors:
        ngh_id = ngh['id']
        constraint = ngh['type']
        node_ids = ngh['nodes'].split(",")
        
        filter = ""
        
        
        for count, nid in enumerate(ngh['labels'].split(",")):            
            filter += "ID("+nid+") = " + ngh['nodes'].split(",")[count] + " AND "
    
        test_query = constraint.replace("WHERE", "WHERE "+filter )
        app.logger.info(f"Test Query: {test_query}")
        if(neo4jConnector.query(test_query)==[]):
            solved_count+=1
            neo4jConnector.merge_query("MATCH (v:Violation) WHERE ID(v)= "+str(ngh_id)+" SET v.solved=True")
            neo4jConnector.query("MATCH (v:Violation) WHERE ID(v)="+str(ngh_id)+" CALL apoc.refactor.rename.label('Violation', 'SolvedViolation', [v]) YIELD committedOperations RETURN committedOperations")
            
    return solved_count


def compute_introduced():
    global global_constraints
    count = 0
    for constraint in global_constraints:
        cc = neo4jConnector.query(constraint['constraints'])
        count+=len(cc)
    return count
        



def create_repair(repair,violation):
    filter = re.findall(r'\$(\w+)', repair)[0]


    isNode =len([item for item in violation['nodes'] if item['label'] == filter]) >0
    if(isNode):
        node = [item for item in violation['nodes'] if item['label'] == filter][0]
        id = node['id']
        repair=repair.replace('$'+filter, id.split(":")[-1])
    else:
        edge = [item for item in violation['relationships'] if item['label'] == filter][0]        
        id = edge['id']
        repair=repair.replace('$'+filter, id.split(":")[-1])
    return repair

@app.route('/applyRepair', methods=['POST'])
def apply_repair():
    initial_count=neo4jConnector.query("MATCH (v:Violation {solved:False}) RETURN COUNT(v) as count")[0]['count']
    repair = request.get_json()['repair']
    transformations = repair.split("UNION")
    violation = request.get_json()['violation']
    username = request.get_json()['username']
    app.logger.info(f"Repair: {repair}, Violation: {violation}, Username: {username}")
    final_repair = ""
    for t in transformations:
        final_repair += create_repair(t,violation['violation']) + " UNION "
    final_repair = final_repair[:-6]
    app.logger.info(f"Repair: {final_repair}")
    is_repair = False
    if('delete' in final_repair.lower()):
        is_repair = True
    else:
        is_repair = isRepair(final_repair,violation)
    app.logger.info(f"Is Repair: {is_repair}")
    if(not is_repair):
        return jsonify({'error': 'This Repair does not fix the violation'}), 400
    #if(session['safety']):
    if(False):
        safe = checkSafety(final_repair,violation)
        if(not safe):
            return jsonify({'error': 'This repair is not safe'}), 400
    else:
        neo4jConnector.merge_query(final_repair)
        neo4jConnector.query("MATCH (v:Violation) WHERE ID(v)="+str(violation['violation_id'])+" CALL apoc.refactor.rename.label('Violation', 'SolvedViolation', [v]) YIELD committedOperations RETURN committedOperations")
           
        new_subgraph = neo4jConnector.query("MATCH (v:SolvedViolation) WHERE ID(v)="+str(violation['violation_id'])+" RETURN v.node_ids as nodes,v.node_labels as labels, v.pattern as type")
        
        
        app.logger.info(f"New Subgraph: {new_subgraph}")    
        sub_g_query = new_subgraph[0]['type']
        filter = ""
        
        
        for count, nid in enumerate(new_subgraph[0]['labels'].split(",")):            
            filter += "ID("+nid+") = " + new_subgraph[0]['nodes'].split(",")[count] + " AND "
            
        sub_query = sub_g_query.split("WHERE")[0] + "WHERE " + filter[:-4] + " RETURN *"
        new_subgraph = neo4jConnector.query(sub_query)
        app.logger.info(f"New Subgraph: {new_subgraph}")  
        new_subgraph_object = new_to_viz_json(new_subgraph,[])
        
        timestamp = str(int(time.time()))
        
        solved = solve_additional_violations(final_repair,violation)
        introduced = compute_introduced()
        app.logger.info(f"Count before: {initial_count}")
        app.logger.info(f"Solved: {solved}")
        app.logger.info(f"Count after: {introduced}")
        introduced = introduced - initial_count + solved
        app.logger.info(f"Count after: {introduced}")
        neo4jConnector.merge_query("create (p:Repair {solved :"+str(solved)+",introduced:"+str(introduced)+", repair:'"+final_repair+"', timestamp:'"+timestamp+"', previous:'"+json.dumps(violation['violation']).replace('"','|').replace("'","^")+"', new:'"+json.dumps(new_subgraph_object).replace('"','|').replace("'","^")+"'}) with p MATCH (v) WHERE id(v)="+str(violation['violation_id']+" with p,v MATCH (u:User) where u.username='"+username+"' with p,v,u merge (u)-[:APPLY]->(p)-[:TO]->(v)"))


    return jsonify({'message': 'Repair applied successfully'}), 200

    
    


def update_grdg():
    if(neo4jConnector.query("RETURN gds.graph.exists('grdg')")[0]["gds.graph.exists('grdg')"]):
            neo4jConnector.merge_query("CALL gds.graph.drop('grdg') YIELD graphName;")
    build_grdg =  neo4jConnector.merge_query("CALL gds.graph.project('grdg', 'Violation', {INTERSECT: {orientation: 'UNDIRECTED'}})")
    app.logger.info(f"Rebuild GRDG: {build_grdg}")
    compute_btw = neo4jConnector.query("CALL gds.degree.write('grdg', { writeProperty: 'degree' }) YIELD centralityDistribution, nodePropertiesWritten RETURN centralityDistribution.min AS minimumScore, centralityDistribution.mean AS meanScore, nodePropertiesWritten")
    app.logger.info(compute_btw)
    compute_pr = neo4jConnector.query("CALL gds.pageRank.write('grdg', { writeProperty: 'pageRank' , maxIterations: 20, dampingFactor: 0.85 }) YIELD centralityDistribution, nodePropertiesWritten RETURN centralityDistribution.min AS minimumScore, centralityDistribution.mean AS meanScore, nodePropertiesWritten,centralityDistribution.max AS maximumScore")
    app.logger.info(compute_pr)
    results = neo4jConnector.merge_query("MATCH (v:Violation) set v.locked=false")
    app.logger.info("Finish rebuilding")


def create_grdg():
    if(neo4jConnector.query("RETURN gds.graph.exists('grdg')")[0]["gds.graph.exists('grdg')"]):
            neo4jConnector.merge_query("CALL gds.graph.drop('grdg') YIELD graphName;")
    results = neo4jConnector.merge_query("CALL apoc.periodic.iterate('MATCH (v1:Violation)<-[:BELONGS]-(a)-[:BELONGS]->(v2:Violation) WHERE id(v1)<>id(v2) and not (v1)-[:INTERSECT]-(v2) with v1,v2 return v1,v2','merge (v1)-[:INTERSECT]-(v2)', {batchSize:1000})")
    app.logger.info(f"Results: {results}")
    build_grdg =  neo4jConnector.merge_query("CALL gds.graph.project('grdg', 'Violation', {INTERSECT: {orientation: 'UNDIRECTED'}})")
    app.logger.info(f"Build GRDG: {build_grdg}")
    compute_btw = neo4jConnector.query("CALL gds.degree.write('grdg', { writeProperty: 'degree' }) YIELD centralityDistribution, nodePropertiesWritten RETURN centralityDistribution.min AS minimumScore, centralityDistribution.mean AS meanScore, nodePropertiesWritten")
    app.logger.info(compute_btw)
    compute_pr = neo4jConnector.query("CALL gds.pageRank.write('grdg', { writeProperty: 'pageRank' , maxIterations: 20, dampingFactor: 0.85 }) YIELD centralityDistribution, nodePropertiesWritten RETURN centralityDistribution.min AS minimumScore, centralityDistribution.mean AS meanScore, nodePropertiesWritten,centralityDistribution.max AS maximumScore")
    app.logger.info(compute_pr)
    results = neo4jConnector.merge_query("MATCH (v:Violation) set v.locked=false")
    results = neo4jConnector.merge_query("CREATE INDEX IF NOT EXISTS FOR (n:Violation) ON (n.id)")
    results = neo4jConnector.merge_query("CREATE INDEX IF NOT EXISTS FOR (n:Violation) ON (n.solved)")
    app.logger.info("Finish")


@app.route('/getViolationToRepair', methods=['GET'])
def get_violation_to_repair():
    num_viols=neo4jConnector.query("MATCH (v:Violation {solved:False}) RETURN COUNT(v) as count")
    if(num_viols[0]['count']==0):
        return jsonify({'message': 'Finish'}), 200
    else:
        assigned_hypervertex = neo4jConnector.query_violation("MATCH (v:Violation {locked : false}) RETURN v ORDER BY v.degree LIMIT 1")
        if(len(assigned_hypervertex)==0):
            return jsonify({'message': 'Wait'}), 200
        assigned_hypervertex=assigned_hypervertex[0][0]
        app.logger.info(f"Assigned Hypervertex: {assigned_hypervertex}")
        violation_id=assigned_hypervertex.element_id_property.split(":")[-1]      
    
        #lock the violation
        neo4jConnector.merge_query("MATCH (v:Violation) WHERE ID(v)="+str(violation_id)+" SET v.locked = true, v.assigned=true")
        #lock thr neighbors
        neo4jConnector.merge_query("MATCH (v:Violation) WHERE ID(v)="+str(violation_id)+" CALL apoc.neighbors.athop(v, 'INTERSECT', 1) YIELD node SET node.locked = true")

        subgraph_query=""
        
        if 'Return' in assigned_hypervertex.type:
            subgraph_query = assigned_hypervertex.type.split("Return")[0]
        
        if 'RETURN' in assigned_hypervertex.type:
            subgraph_query = assigned_hypervertex.type.split("RETURN")[0]
        
        if 'return' in assigned_hypervertex.type:
            subgraph_query = assigned_hypervertex.type.split("return")[0]
        
        violation_node_ids = assigned_hypervertex.node_ids.split(",")
        violation_rel_ids = assigned_hypervertex.rel_ids.split(",")
        violation_node_labels = assigned_hypervertex.node_labels.split(",")
        violation_rel_labels = assigned_hypervertex.rel_labels.split(",")
        
        
        filter = ""
        for index, nv in enumerate(violation_node_labels):
            if index > 0:
                filter += " AND "
            filter += "ID(" + nv + ") = " + violation_node_ids[index]
        # for index, ev in enumerate(violation_rel_labels):
        #     filter += " AND "
        #     filter += "ID(" + ev + ") = " + violation_rel_ids[index]
        
        query = ""
        
        if 'WHERE' in subgraph_query:
            query = subgraph_query + " AND " + filter 
        else:
            query = subgraph_query + " WHERE " + filter
        
        
        query += " RETURN *"
        app.logger.info(f"Query: {query}")
        results = neo4jConnector.query(query)
        app.logger.info(f"Results: {results}")
        result_node_ids = [int(results[0][el].element_id.split(":")[-1]) for el in results[0]]
        
        neighbors_query = '''WITH '''+str(result_node_ids)+''' AS idList  
                            MATCH (n)-[r]-(neighbor)
                            WHERE ID(n) IN idList AND NOT ID(neighbor) IN idList AND NOT neighbor:Violation 
                            RETURN DISTINCT neighbor, r'''
        
        neighbors_results= neo4jConnector.query(neighbors_query)
        
        
        
        
        graph_object = to_viz_json(results, neighbors_results)
        violation_object = to_viz_json(results,[])
        
        
            
        
        
        return jsonify({'violation_id':violation_id,'violation': violation_object,'pattern':assigned_hypervertex.pattern,'node_ids' : assigned_hypervertex.node_ids,'rel_ids' : assigned_hypervertex.rel_ids,'node_labels' : assigned_hypervertex.node_labels,'rel_labels' : assigned_hypervertex.rel_labels, 'context':graph_object, 'constraint':assigned_hypervertex.type, 'repairs':assigned_hypervertex.repairs.split(','), 'text':assigned_hypervertex.text, 'atomic_repairs':assigned_hypervertex.atomic_repairs.split(';')}), 200


@app.route('/getConstraints', methods=['GET'])
def get_constraints():
    global global_constraints
    return jsonify({'constraints':global_constraints}), 200



@app.route('/upload_constraints', methods=['POST'])
def upload_constraints():
    print("called")
    global global_constraints
    session['safety'] = False
    data = request.get_json()
    
    # Check if 'constraints' is in the received data
    if 'constraints' not in data:
        return jsonify({'error': 'No constraints provided'}), 400

    app.logger.info(f"Data: {data}")
    constraints = data['constraints']
    app.logger.info(f"Constraints: {constraints}")
    global_constraints = constraints
    # Generate a unique task ID and store it in session
    task_id = str(uuid.uuid4())
    session['task_id'] = task_id
    
    # Create a background thread to process the CSV
    thread = threading.Thread(target=detect_violation, args=(task_id, constraints))
    thread.start()

        
    # Respond back with a success message
    return jsonify({'message': 'Constraints received successfully', 'count': len(constraints)}), 200


@app.route('/getSchema', methods=['GET'])
def get_schema():
    graph_object = {"nodes":[], "relationships":[]}
    # Render the results page if task is complete
    schema = neo4jConnector.getSchema()
    for node in schema[0]['nodes']:
        id = node.element_id
        graph_object['nodes'].append({'id':id})
        properties = {}
        for l, v in node.items():
            if(l in ["mass","height","name","model","vehicle_class","length","width","title","release_date","episode_id","average_height"]):
                properties[l] = v
        graph_object['nodes'][-1]['properties']=properties
    for rel in schema[0]['relationships']:
        nodes = rel.nodes
        id1 = nodes[0].element_id
        id2 = nodes[1].element_id        
        types= rel.type
        graph_object['relationships'].append({'nodes': [id1,id2], 'type': types})
    
    return jsonify({'schema':graph_object}), 200


@app.route('/getViolations', methods=['GET'])
def get_violation():
    violations = neo4jConnector.pandas_query('MATCH (v:Violation) RETURN v')
    
    return jsonify({'violations':violations.to_json(orient="records")}), 200


@app.route('/getRepairs', methods=['GET'])
def get_repair():
    repairs = neo4jConnector.pandas_query('MATCH (u:User)-[:APPLY]->(r:Repair) RETURN u.username AS username, r.solved as solved, r.introduced as introduced')
    
    return jsonify({'repairs':repairs.to_json(orient="records")}), 200


@app.route('/getFullRepairs', methods=['GET'])
def get_full_repair():
    repairs = neo4jConnector.pandas_query('MATCH (u:User)-[:APPLY]->(r:Repair) RETURN u.username AS username, r.solved as solved, r.introduced as introduced, r.previous as prev, r.new as new, r.repair as repair')
    
    return jsonify({'repairs':repairs.to_json(orient="records")}), 200


#MATCH (u:User)-[:APPLY]->(r:Repair) RETURN u.username AS user, COLLECT(r) AS repairs, COUNT(r) AS repair_count

@app.route('/getSolvedViolations', methods=['GET'])
def get_solved_violation():
    violations = neo4jConnector.pandas_query('MATCH (v:SolvedViolation) RETURN v')
    
    return jsonify({'solved_violations':violations.to_json(orient="records")}), 200


@app.route('/getUsers', methods=['GET'])
def get_user():
    users = neo4jConnector.pandas_query('MATCH (u:User) RETURN u.username as username, u.link as link')
    
    return jsonify({'users':users.to_json(orient="records")}), 200

@app.route('/getIterations', methods=['GET'])

def get_iteration():
    iterations = neo4jConnector.pandas_query('MATCH (v:Violation) RETURN v')
    return jsonify({'iterations':iterations.to_json(orient="records")}), 200

@app.route('/getInteractions', methods=['GET'])
def get_interaction():
    interactions = neo4jConnector.pandas_query('MATCH (r:Repair) RETURN r')
    return jsonify({'interactions':interactions.to_json(orient="records")}), 200


@app.route('/getFree', methods=['GET'])
def get_free():
    assigned_hypervertex = neo4jConnector.query_violation("MATCH (v:Violation {locked : false}) RETURN v ORDER BY v.degree LIMIT 1")
    assigned = neo4jConnector.query_violation("MATCH (v:Violation {assigned : true}) RETURN v ORDER BY v.degree LIMIT 1")
    if(len(assigned)==0):
        thread = threading.Thread(target=update_grdg)
        thread.start()
    
    if(len(assigned_hypervertex)==0):
        return jsonify({'message': 'False'}), 200
    else:
        return jsonify({'message': 'True'}), 200

@app.route('/addUser', methods=['POST'])
def addUser():
    try:
        data = request.get_json()
        username = data.get("username")

        if not username :
            return jsonify({"error": "Username is required"}), 400

        neo4jConnector.merge_query(f"CREATE (u:User {{username: '{username}', link: 'http://localhost:3000/repairsession/{username}'}})")
        
        return jsonify({"message": "User created"})

    except Exception as e:
        app.logger.error(f"Error adding user: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/removeUser', methods=['POST'])
def removeUser():
    try:
        data = request.get_json()
        username = data.get("username")

        if not username :
            return jsonify({"error": "Username is required"}), 400

        neo4jConnector.merge_query(f"MATCH (u:User {{username: '{username}' }}) DETACH DELETE u")
        
        return jsonify({"message": "User created"})

    except Exception as e:
        app.logger.error(f"Error adding user: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    schema = process_csv_task(file.read())
    transformed_schema = []
    for entry in schema:
        nodes = [
            {
                'id': node.element_id,
                'labels': list(node.labels),
                'properties': node._properties
            }
            for node in entry['nodes']
        ]

        relationships = [
            {
                'id': rel.element_id,
                'type': rel.type,
                'start_node_id': rel.start_node.element_id,
                'end_node_id': rel.end_node.element_id,
                'properties': rel._properties
            }
            for rel in entry['relationships']
        ]

        transformed_schema.append({
            'nodes': nodes,
            'relationships': relationships
        })
    app.logger.info(f"Schema: {schema}")
    app.logger.info(f"Tranformed Schema: {transformed_schema}")
    return jsonify({'message': 'file_uploaded', 'schema': transformed_schema}), 200    



class FlaskLogger:
    def __init__(self, app=None, log_file="app.log", log_level=logging.INFO, max_bytes=10 * 1024 * 1024, backup_count=5):
        """
        Initialize the logger.

        :param app: Flask app instance. If None, call `init_app` later.
        :param log_file: Path to the log file.
        :param log_level: Logging level (e.g., logging.INFO, logging.DEBUG).
        :param max_bytes: Max size of the log file in bytes before rotation.
        :param backup_count: Number of backup log files to keep.
        """
        self.app = app
        self.log_file = log_file
        self.log_level = log_level
        self.max_bytes = max_bytes
        self.backup_count = backup_count

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        """
        Initialize the logger with the Flask app.

        :param app: Flask app instance.
        """
        # Ensure the log directory exists
        log_dir = os.path.dirname(self.log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)

        # Set the logging level
        app.logger.setLevel(self.log_level)

        # Create a rotating file handler
        file_handler = RotatingFileHandler(
            self.log_file, maxBytes=self.max_bytes, backupCount=self.backup_count
        )
        file_handler.setLevel(self.log_level)

        # Create a console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(self.log_level)

        # Define a logging format
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)

        # Add handlers to the Flask app's logger
        app.logger.addHandler(file_handler)
        app.logger.addHandler(console_handler)

        # Optionally, silence default Flask console logs
        if not app.debug:
            app.logger.propagate = False

        # Inform about logger setup
        app.logger.info("Logger has been configured.")




if __name__ == '__main__':
    logger = FlaskLogger(app, log_file="logs/app.log", log_level=logging.DEBUG)
    app.run(port=5000, debug=True)  # Run the app in debug mode on port 5000