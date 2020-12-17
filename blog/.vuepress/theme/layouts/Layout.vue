<template>
    <VuetifyBase>
        <BaseListLayout v-if="$pagination"/>
        <PostBody v-else />
    </VuetifyBase>
</template>
