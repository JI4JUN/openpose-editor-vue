<script setup lang="ts">
import { StyleProvider } from 'ant-design-vue';
</script>

<template>
    <StyleProvider hash-priority="high">
        <router-view />
    </StyleProvider>
</template>

<style scoped>
</style>
