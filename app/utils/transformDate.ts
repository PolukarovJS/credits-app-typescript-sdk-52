export const transformDate = (firstDate: Date) => {
    const month = (m: number) => {
        const months = {
            0: 'января',
            1: 'февраля',
            2: 'марта',
            3: 'апреля',
            4: 'мая',
            5: 'июня',
            6: 'июля',
            7: 'августа',
            8: 'сентября',
            9: 'октября',
            10: 'ноября',
            11: 'декабря',
        }
        function hasKey<O extends object>(obj: O, key: PropertyKey): key is keyof O {
            return key in obj
        }
        if (hasKey(months, m)) {
            return months[m] || months[0]
        }
    }

    let firstDateString = ''
    if (firstDate !== undefined) {
        let str = firstDate.toString()
        firstDateString =
            new Date(str).getDate().toString() +
            ' ' +
            month(new Date(str).getMonth()) +
            ' ' +
            new Date(str).getFullYear().toString() +
            ' г.'
    } else firstDateString = '1 января 0000 г.'

    return firstDateString
}

export const transformDateD = (firstDate: Date) => {
    const month = (m: number) => {
        const months = {
            0: '01',
            1: '02',
            2: '03',
            3: '04',
            4: '05',
            5: '06',
            6: '07',
            7: '08',
            8: '09',
            9: '10',
            10: '11',
            11: '12',
        }
        function hasKey<O extends object>(obj: O, key: PropertyKey): key is keyof O {
            return key in obj
        }
        if (hasKey(months, m)) {
            return months[m] || months[0]
        }
    }
    if (firstDate !== undefined) {
        let str = firstDate.toString()

        let firstDateString: string =
            month(new Date(str).getMonth()) + '.' + new Date(str).getFullYear().toString()

        return firstDateString
    } else return '01.0000'
}

export const transformDateN = (firstDate: Date) => {
    const month = (m: number) => {
        const months = {
            0: '01',
            1: '02',
            2: '03',
            3: '04',
            4: '05',
            5: '06',
            6: '07',
            7: '08',
            8: '09',
            9: '10',
            10: '11',
            11: '12',
        }
        function hasKey<O extends object>(obj: O, key: PropertyKey): key is keyof O {
            return key in obj
        }
        if (hasKey(months, m)) {
            return months[m] || months[0]
        }
    }
    if (firstDate !== undefined) {
        let str = firstDate.toString()
        let day = new Date(str).getDate()
        let stringDay = ''
        if (day < 10) {
            switch (day) {
                case 1:
                    stringDay = '01'
                    break
                case 2:
                    stringDay = '02'
                    break
                case 3:
                    stringDay = '03'
                    break
                case 4:
                    stringDay = '04'
                    break
                case 5:
                    stringDay = '05'
                    break
                case 6:
                    stringDay = '06'
                    break
                case 7:
                    stringDay = '07'
                    break
                case 8:
                    stringDay = '08'
                    break
                case 9:
                    stringDay = '09'
                    break
                default:
                    break
            }
        } else {
            stringDay = day.toString()
        }

        let firstDateString: string =
            stringDay +
            '.' +
            month(new Date(str).getMonth()) +
            '.' +
            new Date(str).getFullYear().toString()

        return firstDateString
    } else return '01.01.0000'
}

export const transformDateL = (firstDate: Date) => {
    const month = (m: number) => {
        const months = {
            0: 'января',
            1: 'февраля',
            2: 'марта',
            3: 'апреля',
            4: 'мая',
            5: 'июня',
            6: 'июля',
            7: 'августа',
            8: 'сентября',
            9: 'октября',
            10: 'ноября',
            11: 'декабря',
        }
        function hasKey<O extends object>(obj: O, key: PropertyKey): key is keyof O {
            return key in obj
        }
        if (hasKey(months, m)) {
            return months[m] || months[0]
        }
    }

    let firstDateString = ''
    if (firstDate !== undefined) {
        let str = firstDate.toString()
        firstDateString =
            new Date(str).getDate().toString() + ' ' + month(new Date(str).getMonth())
    } else firstDateString = '1 января'

    return firstDateString
}
