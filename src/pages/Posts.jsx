import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Posts = () => {
  return (
    <DashboardLayout title="Posts">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Community Posts</h2>
          <p className="text-muted-foreground">
            Share your thoughts and connect with others on their mental health journey.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Posts Feature</CardTitle>
            <CardDescription>Coming Soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Posts functionality will be implemented here. This will include creating, viewing, and interacting with community posts.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Posts;