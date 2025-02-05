from pydantic import BaseModel, Field
from arango.typings import Json


class UserAuthorization(BaseModel):
    email: str
    password: str


class UserRegistration(BaseModel):
    name: str
    surname: str
    email: str
    password: str


class Place(BaseModel):
    name: str
    type: str
    address: str
    phone_number: str


class File(BaseModel):
    content: Json


class GroupAnnouncement(BaseModel):
    group_id: str
    announcement: Json


class UserAnnouncement(BaseModel):
    user_id: str
    announcement: Json


class Comment(BaseModel):
    user_id: str
    announcement_id: str
    comment: Json


class Star(BaseModel):
    From: str = Field(alias="from")
    to: str


class Group(BaseModel):
    name: str

class UpdateUser(BaseModel):
    id: int
    first_name: str
    last_name: str
    talents: list
    photo: str

class UpdateGroup(BaseModel):
    id: int
    name: str
    photo: str

class FilterUser(BaseModel):
    first_name: str|None
    last_name: str|None
    talents: str|None
    groups: str|None
    from_date: str | None
    to_date: str | None
    from_creation: str | None
    to_creation: str | None
    from_stars: str | int | None
    to_stars: str | int | None

class FilterGroup(BaseModel):
    name: str|None
    genre: str|None
    from_date: str | None
    to_date: str | None
    from_creation: str | None
    to_creation: str | None
    from_stars: str | int | None
    to_stars: str | int | None
    participant: str|None

class FilterAnnouncement(BaseModel):
    producer: str|None
    from_date: str|None
    to_date: str|None
    from_stars: str|int|None
    to_stars: str|int|None
    tag: str|None

class FilterPlace(BaseModel):
    name: str|None
    type: str|None
    address: str|None
    number: str|None
    equipment: str|None
    from_date: str | None
    to_date: str | None
    from_creation: str | None
    to_creation: str | None
