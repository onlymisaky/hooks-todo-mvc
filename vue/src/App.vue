<template>
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input v-model="data.title"
        class="new-todo"
        placeholder="What needs to be done?"
        autofocus
        @keyup.enter="onAddTodo">
    </header>

    <!-- This section should be hidden by default and shown when there are todos -->
    <section class="main">
      <template v-if="allTodos.length > 0">
        <input id="toggle-all"
          class="toggle-all"
          type="checkbox"
          v-model="allCompleted">
        <label for="toggle-all">Mark all as complete</label>
      </template>
      <ul class="todo-list">
        <!-- These are here just to show the structure of the list items -->
        <!-- List items should get the class `editing` when editing and `completed` when marked as completed -->
        <li v-for="todo in todos"
          :key="todo.id"
          :class="{
            'completed': todo.completed,
            'editing': todo.editing
          }">
          <div class="view">
            <input class="toggle"
              type="checkbox"
              v-model="todo.completed">
            <label @dblclick="() => {
              todo.editing = true;
              data.editTitle = todo.title;
            }">{{todo.title}}</label>
            <button class="destroy"
              @click="removeTodo(todo.id)"></button>
          </div>
          <input class="edit"
            v-model="todo.title"
            @blur="editTodo(todo.id, todo.title)"
            @keyup.enter="editTodo(todo.id, todo.title)"
            @keyup.esc="onCancelEdit(todo.id)">
        </li>
      </ul>
    </section>

    <!-- This footer should hidden by default and shown when there are todos -->
    <footer class="footer">
      <!-- This should be `0 items left` by default -->
      <span class="todo-count"><strong>{{activeTodos.length}}</strong> item left</span>
      <!-- Remove this if you don't implement routing -->
      <ul class="filters">
        <li v-for="state in data.stateList"
          :key="state.hash"
          @click="data.state = state.label">
          <a :class="{'selected': data.state===state.label}"
            :href="state.hash">
            {{state.label}}
          </a>
        </li>
      </ul>
      <!-- Hidden if no completed items are left ↓ -->
      <button class="clear-completed"
        @click="removeCompletedTodo">Clear completed</button>
    </footer>

  </section>
</template>

<script lang="ts">
import { defineComponent, ref, computed, reactive } from 'vue';
import { useStorage } from './useStorage';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  editing: boolean;
}

export default defineComponent({
  name: 'App',
  setup() {
    const data = reactive({
      title: '',
      state: 'All',
      stateList: [
        {
          label: 'All',
          hash: '#/',
        },
        {
          label: 'Active',
          hash: '#/active',
        },
        {
          label: 'Completed',
          hash: '#/completed',
        },
      ],
      editTitle: '',
    });

    const allTodos = useStorage<Todo[]>('todos', []);
    const activeTodos = computed(() =>
      allTodos.value.filter((todo) => !todo.completed),
    );
    const completedTodos = computed(() =>
      allTodos.value.filter((todo) => todo.completed),
    );

    const todos = computed(
      () =>
        ({
          All: allTodos.value,
          Active: activeTodos.value,
          Completed: completedTodos.value,
        }[data.state]),
    );

    const allCompleted = computed({
      get() {
        return completedTodos.value.length === allTodos.value.length;
      },
      set(val: boolean) {
        toggleAll(val);
      },
    });

    const ids = computed(() => {
      return allTodos.value.map((item) => item.id);
    });
    const nextId = computed(() => {
      if (ids.value.length) {
        return Math.max(...ids.value) + 1;
      }
      return 1;
    });

    const addTodo = (val: string) => {
      allTodos.value.push({
        completed: false,
        title: val,
        id: nextId.value,
        editing: false,
      });
    };

    const removeTodo = (id: number) => {
      const index = allTodos.value.findIndex((item) => item.id === id);
      if (index >= 0) {
        allTodos.value.splice(index, 1);
      }
    };

    const removeCompletedTodo = () => {
      let n = allTodos.value.length - 1;
      while (n > -1) {
        if (allTodos.value[n].completed) {
          allTodos.value.splice(n, 1);
        }
        n--;
      }
    };

    const toggleTodo = (id: number, completed: boolean) => {
      const index = allTodos.value.findIndex((item) => item.id === id);
      if (index >= 0) {
        allTodos.value[index].completed = completed;
      }
    };

    const toggleAll = (completed: boolean) => {
      allTodos.value.forEach((item) => {
        item.completed = completed;
      });
    };

    const editTodo = (id: number, title: string) => {
      const index = allTodos.value.findIndex((item) => item.id === id);
      if (index >= 0) {
        if (title && title.trim()) {
          allTodos.value[index].editing = false;
          allTodos.value[index].title = title;
        } else {
          removeTodo(id);
        }
      }
    };

    return {
      data,
      allTodos,
      todos,
      allCompleted,
      activeTodos,
      onAddTodo() {
        if (data.title && data.title.trim()) {
          addTodo(data.title);
          data.title = '';
        }
      },
      removeTodo,
      removeCompletedTodo,
      editTodo,
      onCancelEdit(id: number) {
        const index = allTodos.value.findIndex((item) => item.id === id);
        if (index >= 0) {
          allTodos.value[index].title = data.editTitle;
          allTodos.value[index].editing = false;
        }
      },
    };
  },
});
</script>
