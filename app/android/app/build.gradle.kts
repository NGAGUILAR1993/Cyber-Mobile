import java.util.Properties

plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Firma de publicación: se lee de android/key.properties (no se sube al repo)
// o de variables de entorno en CI. Si no existe, se usa la firma de debug.
val firma = Properties().apply {
    val f = rootProject.file("key.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}
fun datoFirma(k: String, env: String): String? = firma.getProperty(k) ?: System.getenv(env)

android {
    namespace = "ar.com.cybermobile.cyber_mobile"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        applicationId = "ar.com.cybermobile.app"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        // Uses the version code from pubspec.yaml. When using split APKs, 1000 * ABI_VERSION
        // is added automatically by Flutter. (https://developer.android.com/studio/build/configure-apk-splits#configure-APK-versions)
        // You can force using the value of versionCode by specifying the `-P force-version-code-ignoring-abi=true`
        // flag during build.
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    val archivoFirma = datoFirma("storeFile", "CM_KEYSTORE_PATH")
    signingConfigs {
        if (archivoFirma != null) {
            create("publicacion") {
                storeFile = file(archivoFirma)
                storePassword = datoFirma("storePassword", "CM_KEYSTORE_PASSWORD")
                keyAlias = datoFirma("keyAlias", "CM_KEY_ALIAS")
                keyPassword = datoFirma("keyPassword", "CM_KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            signingConfig = if (archivoFirma != null) signingConfigs.getByName("publicacion") else signingConfigs.getByName("debug")
            isMinifyEnabled = true
            isShrinkResources = true
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
