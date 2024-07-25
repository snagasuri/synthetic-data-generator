from pydantic import BaseModel, constr
from typing import List

class Message(BaseModel):
    from_: constr(regex='^(human|gpt)$') = 'human'
    value: str

class Conversation(BaseModel):
    messages: List[Message]
