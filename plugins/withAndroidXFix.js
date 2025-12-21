const {
  withProjectBuildGradle,
  withAppBuildGradle,
} = require("@expo/config-plugins");

/**
 * Plugin de Expo para forzar AndroidX y excluir Support Libraries
 */
const withAndroidXFix = (config) => {
  // Modificar build.gradle del proyecto
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes("allprojects")) {
      // Agregar configuración global para excluir support libraries
      const gradleContent = config.modResults.contents;

      if (!gradleContent.includes("configurations.all")) {
        config.modResults.contents = gradleContent.replace(
          /allprojects\s*\{/,
          `allprojects {
    configurations.all {
        exclude group: 'com.android.support', module: 'support-compat'
        exclude group: 'com.android.support', module: 'support-v4'
        exclude group: 'com.android.support', module: 'versionedparcelable'
    }
`
        );
      }
    }
    return config;
  });

  // Modificar build.gradle de la app
  config = withAppBuildGradle(config, (config) => {
    let gradleContent = config.modResults.contents;

    // Agregar configuración para forzar AndroidX
    if (!gradleContent.includes("configurations.all")) {
      gradleContent = gradleContent.replace(
        /dependencies\s*\{/,
        `configurations.all {
    resolutionStrategy {
        force 'androidx.core:core:1.13.0'
        force 'androidx.versionedparcelable:versionedparcelable:1.1.1'
        force 'androidx.localbroadcastmanager:localbroadcastmanager:1.0.0'
    }
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'versionedparcelable'
    exclude group: 'com.android.support', module: 'localbroadcastmanager'
}

dependencies {`
      );
    }

    // Agregar packagingOptions para excluir archivos META-INF duplicados
    if (!gradleContent.includes("packagingOptions")) {
      const androidBlockMatch = gradleContent.match(/android\s*\{/);
      if (androidBlockMatch) {
        const insertPosition =
          androidBlockMatch.index + androidBlockMatch[0].length;
        gradleContent =
          gradleContent.slice(0, insertPosition) +
          `
    packagingOptions {
        resources {
            excludes += [
                'META-INF/androidx.localbroadcastmanager_localbroadcastmanager.version',
                'META-INF/androidx.*.version',
                'META-INF/com.android.support.*.version'
            ]
            pickFirsts += [
                'META-INF/DEPENDENCIES',
                'META-INF/LICENSE',
                'META-INF/LICENSE.txt',
                'META-INF/NOTICE',
                'META-INF/NOTICE.txt'
            ]
        }
    }
` +
          gradleContent.slice(insertPosition);
      }
    }

    config.modResults.contents = gradleContent;
    return config;
  });

  return config;
};

module.exports = withAndroidXFix;
