import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { PollQuiz, Question } from '@/types/languageTypes';
import { Json } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { Layers, PlusCircle, BarChart } from 'lucide-react';

const PollsQuizzes = () => {
  const [polls, setPolls] = useState<PollQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('polls_quizzes')
        .select('*');
      
      if (error) throw error;
      
      // Convert Json[] to Question[] with explicit type casting
      const typedPollQuizzes: PollQuiz[] = data.map(item => ({
        ...item,
        questions: Array.isArray(item.questions) 
          ? item.questions.map(q => q as unknown as Question) 
          : []
      }));
      
      setPolls(typedPollQuizzes);
    } catch (error) {
      console.error('Error fetching polls and quizzes:', error);
      toast({
        title: "Error",
        description: "Failed to load polls and quizzes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  

  function handleCreateNew(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Polls & Quizzes</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin h-8 w-8 border-2 border-[#16849b] rounded-full border-t-transparent"></div>
          </div>
        ) : polls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls.map((poll) => (
              <div key={poll.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold">{poll.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{poll.type.charAt(0).toUpperCase() + poll.type.slice(1)}</p>
                <p className="text-gray-700 mb-4">{poll.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {poll.questions?.length || 0} {poll.questions?.length === 1 ? 'question' : 'questions'}
                  </span>
                  <Button size="sm" className="bg-[#16849b] hover:bg-[#0d7390]">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Polls or Quizzes Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create interactive polls and quizzes to engage your participants during meetings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-[#16849b] hover:bg-[#0d7390] flex items-center gap-2"
                onClick={handleCreateNew}
              >
                <PlusCircle className="h-4 w-4" />
                Create Your First Poll
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

export default PollsQuizzes;
