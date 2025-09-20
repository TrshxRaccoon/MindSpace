
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Wellness = () => {
  return (
    <DashboardLayout title="Wellness">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wellness Center</h2>
          <p className="text-muted-foreground">
            Tools and resources to support your mental health and well-being.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Wellness Feature</CardTitle>
            <CardDescription>Coming Soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Wellness functionality will be implemented here. This will include meditation guides, breathing exercises, mood tracking tools, and mental health resources.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Wellness;