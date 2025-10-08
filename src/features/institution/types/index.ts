export interface InstitutionConfig {
  logo: string;                    // URL de la imagen del logo
  institutionName: string;         // Nombre de la institución
  slogan: string;                  // Eslogan de la institución
  colors: {
    primary: string;               // Color primario (botones principales, acentos)
    secondary: string;             // Color secundario (texto secundario, bordes)
  };
}

export interface InstitutionContextType {
  config: InstitutionConfig;
  updateConfig: (config: InstitutionConfig) => Promise<void>;
  isLoading: boolean;
}
