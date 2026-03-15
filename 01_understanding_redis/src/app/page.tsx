"use client";

import { useState, useTransition, useEffect } from "react";
import { getTodos, addTodo, toggleTodo, deleteTodo, type Todo } from "./actions";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { todos, command } = await getTodos();
        setTodos(todos);
        toast("Redis Command Rendered", { description: command });
      } catch (err) {
        toast.error("Failed to connect to Redis");
        console.error(err);
      } finally {
        setIsInitializing(false);
      }
    }
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    startTransition(async () => {
      try {
        const { command } = await addTodo(text);
        const { todos: refreshedTodos } = await getTodos();
        setTodos(refreshedTodos);
        setText("");
        toast("Added To-Do", { description: `Executed: ${command}` });
      } catch (err) {
        toast.error("Error adding to-do");
      }
    });
  };

  const handleToggle = async (id: string, completed: boolean) => {
    const previous = [...todos];
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));

    startTransition(async () => {
      try {
        const { command } = await toggleTodo(id, completed);
        toast("Toggled To-Do", { description: `Executed: ${command}` });
      } catch (err) {
        setTodos(previous);
        toast.error("Error toggling to-do");
      }
    });
  };

  const handleDelete = async (id: string) => {
    const previous = [...todos];
    setTodos(todos.filter((t) => t.id !== id));

    startTransition(async () => {
      try {
        const { command } = await deleteTodo(id);
        toast("Deleted To-Do", { description: `Executed: ${command}` });
      } catch (err) {
        setTodos(previous);
        toast.error("Error deleting to-do");
      }
    });
  };

  return (
    <main className="container max-w-lg mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Redis To-Do App</CardTitle>
          <p className="text-sm text-muted-foreground">Using Next.js, Redis Hashes & Server Actions.</p>
        </CardHeader>

        <form onSubmit={handleAdd}>
          <CardContent className="flex gap-2">
            <Input
              type="text"
              placeholder="What needs to be done?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isPending || isInitializing}
            />
            <Button type="submit" disabled={isPending || isInitializing || !text.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex flex-col gap-4 !items-stretch">
          <ul className="space-y-3 w-full">
            {isInitializing && (
              <p className="text-muted-foreground py-4 text-center flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> Connecting to Redis...
              </p>
            )}

            {!isInitializing && todos.length === 0 && <p className="text-muted-foreground py-4 text-center text-sm">No to-dos yet. Add one above!</p>}

            {!isInitializing &&
              todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center justify-between p-3 rounded-md border transition-all ${
                    todo.completed ? "bg-muted/50 opacity-60" : "bg-background"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`todo-${todo.id}`}
                      checked={todo.completed}
                      onCheckedChange={() => handleToggle(todo.id, todo.completed)}
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={`todo-${todo.id}`}
                      className={`leading-none cursor-pointer ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {todo.text}
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(todo.id)}
                    disabled={isPending}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
          </ul>
        </CardFooter>
      </Card>

      <Toaster />
    </main>
  );
}
