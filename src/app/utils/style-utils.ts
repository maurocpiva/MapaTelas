export function parseStyleString(
    styleString: string | null | undefined,
    additionalStyles: { [key: string]: string } = {}
): { [key: string]: string } {
    if (!styleString) return { ...additionalStyles };

    const parsedStyles = styleString
        .split(';')
        .filter(style => style.trim() !== '')
        .map(style => style.split(':'))
        .reduce((acc, [key, value]) => {
            acc[key.trim()] = value.trim();
            return acc;
        }, {} as { [key: string]: string });

    return { ...parsedStyles, ...additionalStyles };
}

