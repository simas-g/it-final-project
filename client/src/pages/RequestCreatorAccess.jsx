import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  Info
} from "lucide-react";

export default function RequestCreatorAccess() {
  const { user, isCreator } = useAuth();
  const navigate = useNavigate();
  if (isCreator()) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-2 border-green-500">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription>
            You already have Creator access! You can now create inventories.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex space-x-4">
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
          <Button onClick={() => navigate('/inventory/new')} variant="outline">
            Create Inventory
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        onClick={() => navigate('/dashboard')} 
        variant="ghost" 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 border-2 rounded-lg flex items-center justify-center">
          <Crown className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Request Creator Access</h1>
          <p className="text-muted-foreground mt-1">
            Unlock the ability to create and manage inventories
          </p>
        </div>
      </div>
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Your Current Role</CardTitle>
            <CardDescription>
              Role-based permissions control what you can do
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border-2 rounded-lg">
              <div>
                <p className="font-medium">Current Role:</p>
                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {user?.role || 'USER'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Creator Benefits</CardTitle>
            <CardDescription>
              What you'll be able to do with Creator access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Create Inventories</p>
                <p className="text-sm text-muted-foreground">
                  Build unlimited collections and organize your items
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Share with Others</p>
                <p className="text-sm text-muted-foreground">
                  Control who can view and edit your inventories
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Advanced Features</p>
                <p className="text-sm text-muted-foreground">
                  Access custom fields, tags, and organization tools
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How to get Creator access:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Contact your system administrator</li>
              <li>Request a role upgrade to "CREATOR"</li>
              <li>Once approved, you can start creating inventories!</li>
            </ol>
            <p className="mt-3 text-sm">
              For this demo, you can contact: <strong>admin@example.com</strong>
            </p>
          </AlertDescription>
        </Alert>
        <div className="pt-6 border-t-2">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

