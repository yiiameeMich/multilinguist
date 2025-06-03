# Nuxt MultiLinguist module

Multilinguist is simple, but smoothly working module for easy and seamless localization implementation in Nuxt 3. 

## Key Features

- Easy translations that you're used to
- Works perfectly fine on both SSR + CSR
- No memory leaks and running out of memory errors
- Autocompletion & validation of keys

## Installation

```bash
npm install @yiiamee/multilinguist
```

Then, add the module to your nuxt.config

```nuxt.config.ts
export default defineNuxtConfig({
    modules: [
        @yiiamee/multilinguist,
    ],
    multilinguist: {
        defaultLocale: "en", // string representing key to your default (fallback) locale
        supportedLanguages: ["en", "es"], // array of strings representing all available locales' keys
    },
})
```

Then, create a "locales" directory in /public directory. This is necessary for module to access your languages.

![directory_structure.png](directory_structure.png)

Now, you're ready to use Multilinguist Module!

### t()—famous translate function 
 
```vue
<script setup lang="ts">
const { t } = useMultilinguist(); // Call useMultilinguist composable to get the translate function
  
const pageTitle = computed(() => {
  return t("Hello, World");
});
</script> 

<template>
  <h3>{{ pageTitle }}</h3>
  <button>{{ t("Switch Locale") }}</button>
</template>
```

You can already see how the keys auto-completion works:

![autocompletion.png](autocompletion.png)

And validation:

![validation.png](validation.png)

### Set another value to current locale:

```vue
<script setup lang="ts">
const { t, setLocale } = useMultilinguist();
// setLocale function accepts string, that should match one of defined
// in the nuxt.config strings from supportedLanguages array
  
const pageTitle = computed(() => {
  return t("Hello, World");
});
</script> 

<template>
  <h3>{{ pageTitle }}</h3>
  <button @click="setLocale('es')">{{ t("Switch Locale") }}</button>
</template>
```

### Get current locale

```vue
<script setup lang="ts">
const { t, setLocale, locale } = useMultilinguist();
// locale is SSR friendly, shared among the app ref state  

const pageTitle = computed(() => {
    return t("Hello, World");
});
</script>

<template>
  <h3>{{ pageTitle }}</h3>
  <h6>Current Locale: {{ locale }}</h6>
  <button @click="setLocale('es')">{{ t("Switch Locale") }}</button>
</template>
```