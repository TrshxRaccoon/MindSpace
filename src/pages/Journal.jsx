import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Journal = () => {
  return (
    <DashboardLayout title="Journal">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Personal Journal</h2>
          <p className="text-muted-foreground">
            Record your thoughts, feelings, and daily reflections.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Journal Feature</CardTitle>
            <CardDescription>Coming Soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Journal functionality will be implemented here. This will include creating new entries, viewing past entries, and mood tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Journal;