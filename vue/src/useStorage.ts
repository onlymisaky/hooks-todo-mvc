import { ref, watch, onBeforeMount, onUnmounted, Ref, UnwrapRef } from 'vue';

export function useStorage<T>(
  key: string,
  value?: T,
  type: 'local' | 'session' = 'local'
): Ref<UnwrapRef<T>> {
  const storage = type === 'local' ? localStorage : sessionStorage;
  let val = JSON.parse(storage.getItem(key) ?? JSON.stringify(value));
  const valRef = ref<T>(val);

  watch(
    () => valRef.value,
    () => {
      storage.setItem(key, JSON.stringify(valRef.value));
    },
    { deep: true }
  );

  const onStorageChange = (event: StorageEvent) => {
    if (event.key === key && event.newValue !== JSON.stringify(valRef.value)) {
      valRef.value = JSON.parse(event.newValue);
    }
  }

  onBeforeMount(() => {
    window.addEventListener('storage', onStorageChange)
  });
  onUnmounted(() => {
    window.removeEventListener('storage', onStorageChange)
  });

  return valRef;
}
