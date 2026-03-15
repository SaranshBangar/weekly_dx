"use server";

import { getRedisClient } from "@/lib/redis";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

export async function getTodos() {
  const client = await getRedisClient();
  const todosRecord = await client.hGetAll("todos");

  const todos: Todo[] = Object.values(todosRecord)
    .map((val) => JSON.parse(val))
    .sort((a, b) => b.createdAt - a.createdAt);

  return {
    todos,
    command: `HGETALL todos`,
  };
}

export async function addTodo(text: string) {
  const client = await getRedisClient();
  const id = randomUUID();
  const newTodo: Todo = {
    id,
    text,
    completed: false,
    createdAt: Date.now(),
  };

  const stringified = JSON.stringify(newTodo);
  await client.hSet("todos", id, stringified);

  revalidatePath("/");

  return {
    command: `HSET todos ${id} '${stringified}'`,
  };
}

export async function toggleTodo(id: string, currentlyCompleted: boolean) {
  const client = await getRedisClient();

  const current = await client.hGet("todos", id);
  if (!current) throw new Error("Todo not found");

  const todo = JSON.parse(current) as Todo;
  todo.completed = !currentlyCompleted;

  const stringified = JSON.stringify(todo);
  await client.hSet("todos", id, stringified);

  revalidatePath("/");

  return {
    command: `HGET todos ${id} && HSET todos ${id} '${stringified}'`,
  };
}

export async function deleteTodo(id: string) {
  const client = await getRedisClient();
  await client.hDel("todos", id);

  revalidatePath("/");

  return {
    command: `HDEL todos ${id}`,
  };
}
