<template>
  <BaseLayout>
    <template #content>
      <Page :page="$page" />
    </template>
    <template #sticky>
      <Sticky :page="$page" />
    </template>
  </BaseLayout>
</template>
