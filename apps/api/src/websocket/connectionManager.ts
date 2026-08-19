import { WebSocket } from "ws";

class ConnectionManager {
  private connections: Map<string, WebSocket> = new Map();

  addConnection(userId: string, socket: WebSocket) {
    this.connections.set(userId, socket);
    console.log(`user ${userId} connected`);
  }
  removeConnection(userId: string) {
    this.connections.delete(userId);

    console.log(`User ${userId} disconnected `);
  }

  getConnection(userId: string) {
    return this.connections.get(userId);
  }

  isOnline(userId: string) {
    return this.connections.has(userId);
  }

  sendToUser(userId: string, data: object) {
    const socket = this.connections.get(userId);
    if (!socket) {
      console.log(`User ${userId} is offline `);
      return;
    }

    if (socket.readyState !== WebSocket.OPEN) {
      console.log(`scoket for ${userId} is not open `);
    }

    socket.send(JSON.stringify(data));
  }

  broadcast(data: object) {
    const message = JSON.stringify(data);
    for (const socket of this.connections.values()) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      }
    }
  }
}

export const connectionManager = new ConnectionManager();
