# Grafixer: Enabling User-Centric Repairs for Property Graphs

## Authors
-**Amedeo Pachera**  Lyon1 University, CNRS Liris - Lyon, France - amedeo.pachera@univ-lyon1.fr</p>
-**Angela Bonifati**  Lyon1 University, CNRS Liris& IUF -  Lyon, France - angela.bonifati@univ-lyon1.fr</p>
-**Andrea Mauri**  Lyon1 University, CNRS Liris - Lyon, France - andrea.mauri@univ-lyon1.fr</p>


## Overview
Grafixer is an interactive tool designed for human-in-the-loop repair of property graphs. It enables collaborative identification and correction of data inconsistencies while ensuring an efficient repair process. Users can upload property graph datasets, define constraints using Cypher, and collaboratively resolve violations through an intuitive interface.

## Features
- **Upload Property Graphs**: Supports dataset uploads with constraints written in Cypher.
- **User-Centric Repair**: Allows multiple users to collaboratively repair graph inconsistencies.
- **Real-Time Monitoring**: Provides an interactive dashboard for administrators to track progress.
- **Automated Violation Detection**: Uses a Graph Repair Dependency Graph (GRDG) to manage overlapping data violations.


## Installation
### Prerequisites
- Python 3.8+
- Flask
- ReactJS
- Neo4j community edition (with APOC and GDS plugins) version 5.12

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/pake97/Grafixer-Enabling-User-Centric-Repairs-for-Property-Graphs.git
   cd Grafixer-Enabling-User-Centric-Repairs-for-Property-Graphs
   ```
2. Set up a virtual environment (optional but recommended):
   ```sh
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```sh
   cd venv/flask_app
   pip3 install -r requirements.txt
   ```
4. Set up the Neo4j database:
   - Install Neo4j and activate APOC and GDS plugins.
   - Start Neo4j 
   ```sh
   ./bin/neo4j-admin server console
   ```
5. Run the Flask server:
   ```sh
   python3 app.py
   ```
6. Start the frontend:
   ```sh
   cd Dahsboard
   npm install
   npm start
   ```
7. Visit http://localhost:300 to access GraFixer

## Usage
### 1. Upload a Graph and Constraints
- Upload a property graph dataset along with constraints (CSV format).

### 2. Assign and Resolve Violations
- Users are assigned independent violations based on a selected strategy.
- Users propose repairs using atomic transformations (edge deletion, property update).

### 3. Monitor Progress
- The administrator can monitor active users, resolved violations, and historical repairs via a dashboard.

