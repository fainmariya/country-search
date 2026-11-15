export function mapCountryResponse(raw) {
    const languages = raw.languages.map((language) => language.name);
    return {
        name: raw.name,
        capital: raw.capital,
        region: raw.region,
        population: raw.population,
        flag: raw.flag,
        languages,
    };
}
//# sourceMappingURL=mapCountryResponse.js.map