<script setup lang="ts">
const {t, setLocale, locale} = useMultilinguist();

const switchLocale = () => {
  setLocale(locale.value === "en" ? "es" : "en")
}
</script>

<template>
  <h3>
    {{ t("Hello, World") }}
  </h3>
  <button @click="switchLocale">{{ t("Switch Locale") }}</button>
</template>
