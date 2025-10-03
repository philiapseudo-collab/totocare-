import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Stethoscope, Heart, Activity, AlertCircle } from "lucide-react";
import { useConditions } from "@/hooks/useConditions";
import { format } from "date-fns";

const Conditions = () => {
  const { conditions, loading } = useConditions();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between p-6">
          <div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
              <span>Home</span>
              <span>›</span>
              <span>Conditions</span>
              <span>›</span>
              <span className="text-foreground font-medium">Mother</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Conditions</h1>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Condition
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Condition Summary */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Condition Summary</CardTitle>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-primary text-primary-foreground">Mother</Button>
                    <Button variant="outline" size="sm">Infant</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading conditions summary...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{conditions.length}</p>
                      <p className="text-sm text-muted-foreground">Active Conditions</p>
                      <p className="text-xs text-muted-foreground">
                        {conditions.length === 0 ? 'None' : 'Tracked'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {conditions.filter(c => c.treatment).length}
                      </p>
                      <p className="text-sm text-muted-foreground">With Treatment</p>
                      <p className="text-xs text-muted-foreground">Active plans</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {conditions.filter(c => c.severity === 'severe').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Severe</p>
                      <p className="text-xs text-muted-foreground">Requires attention</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conditions List */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Conditions List</CardTitle>
                  <Button variant="outline" size="sm">Active & History</Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading conditions...</div>
                ) : conditions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">No conditions found</p>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Condition
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conditions.map((condition) => (
                      <div key={condition.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {condition.severity === 'severe' ? (
                                <Heart className="w-5 h-5 text-error" />
                              ) : condition.severity === 'moderate' ? (
                                <Activity className="w-5 h-5 text-warning" />
                              ) : (
                                <Stethoscope className="w-5 h-5 text-success" />
                              )}
                              <div>
                                <h3 className="font-medium">{condition.condition_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {condition.treatment || 'No treatment specified'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Severity</p>
                            <Badge variant="outline" className="capitalize">
                              {condition.severity || 'Unknown'}
                            </Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Diagnosed</p>
                            <p className="font-medium">
                              {condition.diagnosed_date 
                                ? format(new Date(condition.diagnosed_date), 'MMM dd, yyyy')
                                : 'N/A'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant={condition.is_active ? "default" : "secondary"}>
                              {condition.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {conditions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Condition Detail</CardTitle>
                  <p className="text-sm text-muted-foreground">{conditions[0].condition_name}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Severity</label>
                      <p className="font-medium capitalize">{conditions[0].severity || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Status</label>
                      <p className="font-medium">{conditions[0].is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Treatment</label>
                    <p className="font-medium">{conditions[0].treatment || 'None specified'}</p>
                  </div>
                  {conditions[0].notes && (
                    <div className="bg-accent p-3 rounded-lg text-sm text-muted-foreground">
                      {conditions[0].notes}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">Update</Button>
                    <Button size="sm" className="flex-1">Mark Resolved</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <strong>Total Conditions:</strong> {conditions.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Active:</strong> {conditions.filter(c => c.is_active).length}
                </div>
                {conditions.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No conditions tracked. Add your first condition to start managing your health records.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conditions;
