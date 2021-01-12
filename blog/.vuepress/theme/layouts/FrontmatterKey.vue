<template>
  <BaseLayout>
    <template #content>
      <BlogTags :tags="$frontmatterKey.list" />
    </template>
  </BaseLayout>
</template>
