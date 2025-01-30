# Neo4j connection details

uri = "bolt://localhost:7687"  
user = "neo4j"                 
password = "AmePake97"          

import pandas as pd
import datetime
import io
import pathlib
from neomodel import db, config, StructuredNode, RelationshipTo, RelationshipFrom, clear_neo4j_database, StringProperty, IntegerProperty,UniqueIdProperty, BooleanProperty, FloatProperty
from neomodel.integration.pandas import to_dataframe, to_series
import subprocess
import os

config.DATABASE_URL = "bolt://neo4j:AmePake97@localhost:7687/neo4j"


class Violation(StructuredNode):
    node_ids = StringProperty()
    labels= StringProperty()
    solved = BooleanProperty()
    type = StringProperty()
    locked = BooleanProperty()
    degree = FloatProperty()
    text = StringProperty()
    repairs = StringProperty()
    atomic_repairs = StringProperty()
    node_labels = StringProperty()
    pageRank = FloatProperty()
    pattern = StringProperty()
    rel_ids= StringProperty()
    rel_labels= StringProperty()
    
    
    

class Neo4jConnector():

    def __init__(self):
        self.db = db

    def clearNeo4j(self):
        clear_neo4j_database(db, clear_constraints=True, clear_indexes=True)

    def query(self,query):
        results,meta = db.cypher_query(query)
        results_as_dict = [dict(zip(meta, row)) for row in results]
        return results_as_dict
    
    def query_violation(self,query):
        results,meta = db.cypher_query(query,resolve_objects = True)
        return results
    
    
    def pandas_query(self,query):
        df = to_dataframe(db.cypher_query(query))
        return df
        
    def merge_query(self,query):
        results = db.cypher_query(query)
        return results
    
    def query_id(self,query):
        results,meta = db.cypher_query(query)
        return results, meta
    
    def getSchema(self):
        query = """
        CALL db.schema.visualization()
        """
        return self.query(query)

    def getCommunities(self):
        if(self.query("RETURN gds.graph.exists('myGraph')")[0]["gds.graph.exists('myGraph')"]):
            self.merge_query("CALL gds.graph.drop('myGraph') YIELD graphName;")
        self.merge_query("CALL gds.graph.project('myGraph', '*', '*')")
        num_communities=self.query("CALL gds.louvain.write('myGraph', {writeProperty: 'communities'}) YIELD communityCount")
        
        communities={}
        for i in range(num_communities[0]['communityCount']-20):
            
            communities[i]={}
            query="MATCH (a) WHERE a.communities = "+str(i)+" RETURN labels(a) AS labels, a"
            communities[i]['nodes']=self.query(query)
            query="MATCH (a)-[r]-(b) WHERE a.communities = "+str(i)+" and b.communities = "+str(i)+" RETURN DISTINCT labels(a) AS StartLabels, type(r) AS RelationshipType, labels(b) AS EndLabels, properties(r) AS RelationshipProperties ORDER BY StartLabels, RelationshipType, EndLabels"
            communities[i]['edges']=self.query(query)
        return communities
    def load_csv(self, file_content):
        columns = file_content.columns.tolist()
        sep = columns.index("_start")
        for _, row in file_content.iterrows():
            if pd.isna(row["_id"]):  # Row is a relationship if "_id" is NaN
                # Extract relationship details
                relationship_type = row["_type"]
                start_node_id = row["_start"]
                end_node_id = row["_end"]
                properties = {k: v for k, v in row.items() if pd.notna(v) and k not in ["_id", "_labels", "_start", "_end", "_type"] and k in columns[sep:]}
                # Create relationship between start and end nodes
                query = "MATCH (a), (b) WHERE a._id ="+start_node_id+" AND b._id = "+end_node_id+" CREATE (a)-[r:"+relationship_type+" {"
                for k in properties.keys():
                    query += k+":'"+str(properties[k])+"',"
                query = query[:-1]  # Remove trailing comma
                if(len(properties.keys())>0):
                    query += "}]->(b)"
                else:
                    query += "]->(b)"
                self.query(
                    query
                )
            else:  # Row is a node
                # Extract node details
                node_id = row["_id"]
                labels = row["_labels"].split(';')  # Assume labels are semicolon-separated
                properties = {k: v for k, v in row.items() if pd.notna(v) and k not in ["_id", "_labels", "_start", "_end", "_type"] and k in columns[:sep]}

                # Convert labels into Cypher label format
                label_str = ":".join(labels)

                # Create node with labels and properties
                query = "CREATE (n"+label_str+"{_id:"+ node_id
                for k in properties.keys():
                    query += ", "+k+":'"+str(properties[k])+"'"
                query += "})"
                
                self.query(
                    query
                )
        print("CSV loaded successfully")
        # Get all nodes
    def get_all_nodes(self):
        query = """
        MATCH (n)
        RETURN labels(n) AS labels, n
        """
        result = self.query(query)
        nodes = []
        for record in result:
            labels = record["labels"]
            node = record["n"]
            nodes.append({
                "labels": labels,
                "properties": dict(node)
            })
        return nodes
    
        
        
    def get_nodes_and_relationships(self):
        query = (
            "MATCH (a)-[r]->(b) "
            "RETURN DISTINCT labels(a) AS StartLabels, type(r) AS RelationshipType, labels(b) AS EndLabels, properties(r) AS RelationshipProperties "
            "ORDER BY StartLabels, RelationshipType, EndLabels"
        )
        result = self.query(query)
        nodes_and_relationships = []
        for record in result:
            nodes_and_relationships.append({
                "StartLabels": record["StartLabels"],
                "RelationshipType": record["RelationshipType"],
                "EndLabels": record["EndLabels"],
                "RelationshipProperties": dict(record["RelationshipProperties"])  # Convert properties to dictionary
            })
        return nodes_and_relationships

    