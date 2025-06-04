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
  <br />
  <span>{{ t("Paste your variable here", { variable: locale }) }}</span>
  <br />
  <h1>{{ t("nested.Nested key") }}: <span>{{ t("nested.Language") }}</span></h1>
  <h1>{{ t("nested.nested second level.nested second level language") }}</h1>
</template>t
