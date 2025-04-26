/**
 * Рассчитывает параметры аннуитетного кредита.
 * @param sum Сумма кредита
 * @param term Срок кредита в месяцах
 * @param percents Процентная ставка в год
 * @returns Объект с ежемесячным платежом, переплатой и общей суммой всех платежей
 */
export const useCalculateAnnuity = (sum: number, term: number, percents: number) => {
    const percentMonth = percents / 1200;
    const payment = sum * (percentMonth + percentMonth / ((1 + percentMonth) ** term - 1));
    let totalDebt = sum;
    let fullInterests = 0;
    let fullPayment = 0;
  
    for (let i = 1; i <= term; i++) {
      const interests = totalDebt * percentMonth;
      const debt = payment - interests;
      totalDebt -= debt;
      fullInterests += interests;
      fullPayment += interests + debt;
    }
  
    return {
      calculatedPayment: Number(payment.toFixed(2)),
      calculatedFullInterests: Number(fullInterests.toFixed(2)),
      calculatedFullPayment: Number(fullPayment.toFixed(2)),
    };
  };