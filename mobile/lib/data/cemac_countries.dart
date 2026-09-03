/// Pays CEMAC (codes ISO alpha-2).
class CemacCountry {
  const CemacCountry({required this.code, required this.nameFr, required this.nameEn});

  final String code;
  final String nameFr;
  final String nameEn;

  String label(bool isEnglish) => isEnglish ? nameEn : nameFr;
}

const cemacCountries = [
  CemacCountry(code: 'CM', nameFr: 'Cameroun', nameEn: 'Cameroon'),
  CemacCountry(code: 'CF', nameFr: 'République centrafricaine', nameEn: 'Central African Republic'),
  CemacCountry(code: 'TD', nameFr: 'Tchad', nameEn: 'Chad'),
  CemacCountry(code: 'GQ', nameFr: 'Guinée équatoriale', nameEn: 'Equatorial Guinea'),
  CemacCountry(code: 'GA', nameFr: 'Gabon', nameEn: 'Gabon'),
  CemacCountry(code: 'CG', nameFr: 'Congo', nameEn: 'Congo'),
];
