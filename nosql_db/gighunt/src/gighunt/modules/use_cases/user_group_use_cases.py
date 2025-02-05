from arango.graph import Graph

from gighunt.modules.clients.arangodb_client import ArangoDBClient
from gighunt.modules.use_cases.base_edge_use_cases import BaseEdgeUseCases

from enum import Enum

class UserGroupCollections(Enum):
        USERGROUP = "UserGroup"

class UserGroupUseCases(BaseEdgeUseCases):
    def __init__(self, db_client: ArangoDBClient, graph: Graph, vertex_names: dict):
        super().__init__(db_client, graph, vertex_names)
        self.edge_collection_names = UserGroupCollections
