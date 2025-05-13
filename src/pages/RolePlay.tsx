import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Scenario, Role } from '@/types/languageTypes';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PlusCircle, Users, BarChart } from 'lucide-react';

const RolePlay = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    if (user) {
      fetchScenarios();
    }
  }, [user]);

  const fetchScenarios = async () => {
    try {
      const { data, error } = await supabase
        .from('roleplay_scenarios')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      // Map the data to ensure it matches the Scenario interface
      const typedScenarios = data.map(item => {
        // Ensure roles is an array and each role has name and description
        const roles = Array.isArray(item.roles) 
          ? item.roles.map((role: any) => ({
              name: typeof role.name === 'string' ? role.name : '',
              description: typeof role.description === 'string' ? role.description : ''
            }))
          : [];
        
        return {
          ...item,
          roles
        };
      }) as Scenario[];
      
      setScenarios(typedScenarios);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to load role play scenarios",
        variant: "destructive",
      });
    }
  };

  const handleCreateScenario = () => {
    toast({
      title: "Create Scenario",
      description: "This feature will be available in the next update.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Role Play Scenarios</h1>
          <Button 
            className="bg-[#16849b] hover:bg-[#0d7390] flex items-center gap-2"
            onClick={handleCreateScenario}
          >
            <PlusCircle className="h-4 w-4" />
            Create New Scenario
          </Button>
        </div>
        
        {scenarios.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold">{scenario.title}</h2>
                <p className="text-gray-600 mt-2 mb-4">{scenario.description}</p>
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Roles:</h3>
                  {/* Check if scenario.roles exists and is an array with items before mapping */}
                  {scenario.roles && Array.isArray(scenario.roles) && scenario.roles.length > 0 ? (
                    <ul className="space-y-2">
                      {scenario.roles.map((role: Role, index: number) => ( // Use 'Role' type and 'number' for index
                        <li key={role.id || index} className="pl-4 border-l-2 border-gray-300"> {/* Use a stable key like role.id */}
                          <span className="font-medium">{role.name}:</span> {role.description || 'No description'}
                      </li>
                    ))}
                  </ul>
                  ) : (
                     <p className="text-sm text-gray-500 pl-4">No roles defined for this scenario.</p>
                  )}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    toast({
                      title: "Edit Scenario",
                      description: "This feature will be available in the next update.",
                    });
                  }}>
                    Edit
                  </Button>
                  <Button 
                    className="bg-[#16849b] hover:bg-[#0d7390]" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Use in Meeting",
                        description: "This scenario will be available in your next meeting.",
                      });
                    }}
                  >
                    Use in Meeting
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Role Play Scenarios Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create interactive language scenarios with assignable roles to engage your students in realistic conversations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-[#16849b] hover:bg-[#0d7390] flex items-center gap-2"
                onClick={handleCreateScenario}
              >
                <PlusCircle className="h-4 w-4" />
                Create Your First Scenario
              </Button>
              <Link to="/dashboard">
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RolePlay;
