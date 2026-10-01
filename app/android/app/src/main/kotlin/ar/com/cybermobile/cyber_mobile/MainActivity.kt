package ar.com.cybermobile.cyber_mobile

import android.content.Intent
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

// Recibe el texto que la persona comparte hacia Cyber Mobile (un link, un
// mensaje sospechoso) y se lo pasa a Flutter. No se guarda en ningún lado.
class MainActivity : FlutterActivity() {
    private var canal: MethodChannel? = null
    private var textoInicial: String? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        textoInicial = textoCompartido(intent)
        canal = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "ar.com.cybermobile/compartir").apply {
            setMethodCallHandler { call, result ->
                if (call.method == "textoInicial") {
                    result.success(textoInicial)
                    textoInicial = null
                } else {
                    result.notImplemented()
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        textoCompartido(intent)?.let { canal?.invokeMethod("textoCompartido", it) }
    }

    private fun textoCompartido(intent: Intent?): String? {
        if (intent?.action != Intent.ACTION_SEND || intent.type != "text/plain") return null
        val texto = intent.getStringExtra(Intent.EXTRA_TEXT)?.trim() ?: return null
        return texto.take(4000).ifEmpty { null }
    }
}
