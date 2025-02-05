from pydantic import BaseModel
from pydantic_settings import BaseSettings


class ArangoDBSettings(BaseModel):
    protocol: str = "http"
    hostname: str = "db"
    port: str = "8529"
    database_name: str = "prototype-db"
    graph_name: str = "prototype-graph"


class ApplicationSettings(BaseSettings):
    arangodb_settings: ArangoDBSettings = ArangoDBSettings()

    class Config:
        env_nested_delimiter = '__'

    @staticmethod
    def get_settings():
        app_settings = ApplicationSettings()

        if not app_settings.arangodb_settings.hostname:
            raise ValueError("ArangoDB HOSTNAME must be set")
        if not app_settings.arangodb_settings.port:
            raise ValueError("ArangoDB PORT must be set")

        return app_settings
