<script setup lang="ts">
import SnackbarSurface from "./SnackbarSurface.vue";
import { advance, dismiss, snackbarQueue } from "./queue";
import { snackbarTransition } from "./transition";

/** 操作按钮：先跑调用方的回调，再关闭消息。 */
function onAction(): void {
  snackbarQueue.current?.action?.onAction?.();
  dismiss();
}
</script>

<template>
  <!-- 函数式调用的宿主：只有一条消息可见，离场动画结束后再把下一条推上来。 -->
  <Teleport to="body">
    <Transition v-bind="snackbarTransition" @after-leave="advance">
      <SnackbarSurface
        v-if="snackbarQueue.current"
        :key="snackbarQueue.current.id"
        :text="snackbarQueue.current.text"
        :action="snackbarQueue.current.action?.label"
        :dismissible="snackbarQueue.current.dismissible"
        :close-label="snackbarQueue.current.closeLabel"
        @action="onAction"
        @dismiss="dismiss()"
      />
    </Transition>
  </Teleport>
</template>
