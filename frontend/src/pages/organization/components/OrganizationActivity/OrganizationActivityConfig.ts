export enum ORGANIZATION_AREA_ENUM {
  LOCAL = 'Local',
  REGIONAL = 'Regional',
  NATIONAL = 'National',
  INTERNATIONAl = 'International',
}

export const ORGANIZATION_AREAS = [
  {
    label: ORGANIZATION_AREA_ENUM.LOCAL,
    value: '1',
  },
  {
    label: ORGANIZATION_AREA_ENUM.REGIONAL,
    value: '2',
  },
  {
    label: ORGANIZATION_AREA_ENUM.NATIONAL,
    value: '3',
  },
  {
    label: ORGANIZATION_AREA_ENUM.INTERNATIONAl,
    value: '4',
  },
];

export const OrganizationActivityConfig: Record<string, any> = {
  domains: {
    key: 'domains',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required',
      },
    },
    config: {
      title: 'Domenii de activitate*',
      helperText: 'Minim 1 domeniu de activitate.',
    },
  },
  area: {
    key: 'area',
    label: 'Organizatia isi desfasoara activitatea pe plan',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'Lorem ipsum. Alege din lista sau adauga valoare.',
    radioConfigs: [...ORGANIZATION_AREAS.map((item) => ({ ...item, name: 'area' }))],
  },
  cities: {
    key: 'cities',
    label: 'Localitati in care activeaza organizatia',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'Cauta in lista',
  },
  regions: {
    key: 'regions',
    rules: {
      required: {
        value: true,
        message: 'Regions is required.',
      },
    },
    config: {
      type: 'text',
      label: 'Regiuni in care activeaza organizatia*',
      collection: [],
      helperText: 'Lorem ipsum. Alege din lista sau adauga valoare.',
      displayedAttribute: 'name',
    },
  },
  isPartOfFederation: {
    key: 'isPartOfFederation',
    label: 'Organizatia apartine de una sau mai multe federatii?*',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'De exemplu, lorem ipsum. Help text. Help text',
    radioConfigs: [
      {
        label: 'Da',
        name: 'isPartOfFederation',
        value: 'true',
      },
      {
        label: 'Nu',
        name: 'isPartOfFederation',
        value: 'false',
      },
    ],
  },
  federations: {
    key: 'federations',
    rules: {
      required: {
        value: true,
        message: 'federations is required.',
      },
    },
    config: {
      type: 'text',
      label: 'Mentioneaza federatii*',
      collection: [],
      displayedAttribute: 'abbreviation',
    },
  },
  isPartOfCoalition: {
    key: 'isPartOfCoalition',
    label: 'Organizatia apartine de una sau mai multe coalitii?*',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'De exemplu, lorem ipsum. Help text. Help text',
    radioConfigs: [
      {
        label: 'Da',
        name: 'isPartOfCoalition',
        value: 'true',
      },
      {
        label: 'Nu',
        name: 'isPartOfCoalition',
        value: 'false',
      },
    ],
  },
  coalitions: {
    key: 'coalitions',
    rules: {
      required: {
        value: true,
        message: 'coalitions is required.',
      },
    },
    config: {
      type: 'text',
      label: 'Mentioneaza coalitii*',
      collection: [],
      displayedAttribute: 'abbreviation',
    },
  },
  isPartOfInternationalOrganization: {
    key: 'isPartOfInternationalOrganization',
    label: 'Organizatia ta face parte dintr-o organizatie internationala?*',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'De exemplu, lorem ipsum. Help text. Help text',
    radioConfigs: [
      {
        label: 'Da',
        name: 'isPartOfInternationalOrganization',
        value: 'true',
      },
      {
        label: 'Nu',
        name: 'isPartOfInternationalOrganization',
        value: 'false',
      },
    ],
  },

  hasBranches: {
    key: 'hasBranches',
    label: 'Organizatia are filiale sau sucursale?*',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'De exemplu, lorem ipsum. Help text. Help text',
    radioConfigs: [
      {
        label: 'Da',
        name: 'hasBranches',
        value: 'true',
      },
      {
        label: 'Nu',
        name: 'hasBranches',
        value: 'false',
      },
    ],
  },

  branches: {
    key: 'branches',
    label: 'Localitati in care organizatia are filiale sau sucursale*',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'Cauta in lista',
  },
  isSocialServiceViable: {
    key: 'isSocialServiceViable',
    label: 'Esti ONG acreditat pentru servicii sociale?*',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'De exemplu, lorem ipsum. Help text. Help text',
    radioConfigs: [
      {
        label: 'Da',
        name: 'isSocialServiceViable',
        value: 'true',
      },
      {
        label: 'Nu',
        name: 'isSocialServiceViable',
        value: 'false',
      },
    ],
  },

  offersGrants: {
    key: 'offersGrants',
    label: 'Oferi sau administrezi granturi pentru alte ONG-uri?*',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'De exemplu, lorem ipsum. Help text. Help text',
    radioConfigs: [
      {
        label: 'Da',
        name: 'offersGrants',
        value: 'true',
      },
      {
        label: 'Nu',
        name: 'offersGrants',
        value: 'false',
      },
    ],
  },
  isPublicIntrestOrganization: {
    key: 'isPublicIntrestOrganization',
    label: 'Esti declarat ONG de interes public?*',
    rules: {
      required: {
        value: 'true',
        message: 'Field is required.',
      },
    },
    helperText: 'De exemplu, lorem ipsum. Help text. Help text',
    radioConfigs: [
      {
        label: 'Da',
        name: 'isPublicIntrestOrganization',
        value: 'true',
      },
      {
        label: 'Nu',
        name: 'isPublicIntrestOrganization',
        value: 'false',
      },
    ],
  },
};