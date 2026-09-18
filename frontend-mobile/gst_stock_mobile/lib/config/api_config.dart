class ApiConfig {
  // API de production
  static const String baseUrl = "https://totalconceptrdc.org/odoo/api";
  // API locale (émulateur Android : 10.0.2.2 ; appareil réel : IP du PC)
  //static const String baseUrl = 'http://10.0.2.2:8005/api';
  //static const String baseUrl = 'http://192.168.20.61:8005/api';
  static const Duration timeout = Duration(seconds: 120);
}
