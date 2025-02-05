# For work with graph use this documentation:
# https://docs.python-arango.com/en/main/graph.html


from arango import ArangoClient
from arango.collection import VertexCollection, EdgeCollection
from arango.database import StandardDatabase
from arango.graph import Graph
from arango.typings import Json


class ArangoDBClient:
    def __init__(self, client: ArangoClient) -> None:
        self._client = client

        self.__username = "root"
        self.__password = "password"
        self.__system_database = self._client.db(
            "_system", username=self.__username, password=self.__password
        )
    def execute_query(self, query:str):
        return self.__system_database.aql.execute(query)

    def create_database(self, database_name: str) -> bool:
        if not self.__system_database.has_database(database_name):
            return self.__system_database.create_database(database_name)
        return True

    def connect_to_database(self, database_name: str) -> StandardDatabase:
        return self._client.db(
            database_name, username=self.__username, password=self.__password
        )

    def create_graph_in_database(
        self, database: StandardDatabase, graph_name: str
    ) -> Graph:
        if not database.has_graph(graph_name):
            return database.create_graph(graph_name)
        return database.graph(graph_name)

    def create_vertex_collection(
        self, graph: Graph, collection_name: str
    ) -> VertexCollection:
        return graph.create_vertex_collection(collection_name)

    def get_vertex_collection(
        self, graph: Graph, collection_name: str
    ) -> VertexCollection | None:
        if graph.has_vertex_collection(collection_name):
            return graph.vertex_collection(collection_name)
        return None

    def create_edge_collection(
        self,
        graph: Graph,
        edge_collection_name: str,
        first_vertex_collection_name: str,
        second_vertex_collection_name: str,
    ) -> EdgeCollection:
        return graph.create_edge_definition(
            edge_collection_name,
            from_vertex_collections=list(first_vertex_collection_name),
            to_vertex_collections=list(second_vertex_collection_name),
        )

    def get_edge_collection(
        self, graph: Graph, collection_name: str
    ) -> EdgeCollection:
        if graph.has_edge_collection(collection_name):
            return graph.edge_collection(collection_name)
        return None

    def delete_database(self, database_name: str) -> bool:
        return self.__system_database.delete_database(
            database_name, ignore_missing=True
        )

    def add_vertex(
        self, graph: Graph, vertex_collection_name: str, vertex_data: Json
    ) -> bool | Json:
        return graph.insert_vertex(vertex_collection_name, vertex_data)

    def get_vertex(
        self, vertex_collection: VertexCollection, vertex: Json | str
    ) -> Json | None:
        return vertex_collection.get(vertex)

    def update_vertex(
        self, vertex_collection: VertexCollection, vertex: Json | str
    ) -> bool | Json:
        return vertex_collection.update(vertex)

    def delete_vertex(
        self, vertex_collection: VertexCollection, vertex: Json | str
    ) -> bool | Json:
        return vertex_collection.delete(vertex)

    def add_edge(
        self, graph: Graph, edge_collection_name: str, edge_data: Json
    ) -> bool | Json:
        return graph.insert_edge(edge_collection_name, edge_data)

    def get_edge(
        self, edge_collection: EdgeCollection, edge: Json | str
    ) -> Json | None:
        return edge_collection.get(edge)

    def update_edge(
        self, edge_collection: EdgeCollection, edge: Json | str
    ) -> bool | Json:
        return edge_collection.update(edge)

    def delete_edge(
        self, edge_collection: EdgeCollection, edge: Json | str
    ) -> bool | Json:
        return edge_collection.delete(edge)
