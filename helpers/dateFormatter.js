

/**
 * formats a date into an sql server compatible format
 * @param  {Date} date The input date
 * @return {String} SQL Server compatible string
 */
export function dateSerializer (date) {
    if (!date) {
        return null;
    }
    return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
}
