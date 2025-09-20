import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Chat = () => {
  const { id } = useParams();
  
  return (
    <DashboardLayout title={`Chat: ${id}`}>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chat Session</h2>
          <p className="text-muted-foreground">
            Having a conversation in chat room: <span className="font-mono">{id}</span>
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Chat Feature</CardTitle>
            <CardDescription>Coming Soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Chat functionality for ID "{id}" will be implemented here. This will include real-time messaging, AI support, and conversation history.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default Chat