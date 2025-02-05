import logging
from arango.graph import Graph
from arango.exceptions import DocumentInsertError

from gighunt.modules.clients.arangodb_client import ArangoDBClient
from arango.collection import VertexCollection
from arango.typings import Json

from gighunt.modules.use_cases.all_edge_use_cases import EdgeCollectionUseCases


class BaseVertexUseCases:
    def __init__(self, db_client: ArangoDBClient, graph: Graph, name:str, edge_use_cases: EdgeCollectionUseCases) -> None:
        self._logger = logging.getLogger(__name__)
        self._db_client = db_client
        self._graph = graph
        self._name = name
        self.edge_use_cases = edge_use_cases
        if(not self._graph.has_vertex_collection(self._name)):
            self._db_client.create_vertex_collection(self._graph, name)

    def get_all_entities(self)-> VertexCollection | None:
        if self._graph.has_vertex_collection(self._name):
            return self._graph.vertex_collection(self._name)
        return None

    def create_new_entity(self, vertex_data:Json)->bool|Json:
        return self._db_client.add_vertex(self._graph, self._name, vertex_data)

    def get_entity(self, entity_id: str) -> Json | None:
        return self._graph.vertex_collection(self._name).get(entity_id)

    def get_another_entity(self, entity_id: str, collection_name:str):
        return self._graph.vertex_collection(collection_name).get(entity_id)

    def insert_json_vertex(self, json_vertex: Json) -> None:
        try:
            self._graph.vertex_collection(self._name).insert(json_vertex)
        except DocumentInsertError as err:
            self._logger.error(f"Error inserting vertex {json_vertex}: {err}")

    def clear(self) -> None:
        self._graph.vertex_collection(self._name).truncate()

    def get_all_entities_count(self) -> int:
        return len(self.get_all_entities().all().batch())
