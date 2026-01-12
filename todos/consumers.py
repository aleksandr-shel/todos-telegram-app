
from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json

class TodoConsumer(AsyncJsonWebsocketConsumer):
    group_name = 'todos'

    async def connect(self):
        # user = self.scope['user']
        # if user.is_anonymous:
        #     await self.close()
        #     return
        # await self.channel_layer.group_add(self.group_name, self.channel_name)
        # await self.accept()

        self.group_name = "global_chat"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # Broadcast to group (everyone, including sender)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type":"chat_message",
                "message":f"Echo:{message}"
            }
        )

    async def chat_message(self,event):
        message = event['message']

        await self.send(text_data=json.dumps({
            "message":message
        }))
        