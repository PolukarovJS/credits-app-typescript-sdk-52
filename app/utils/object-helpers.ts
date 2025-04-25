export const updateObjectInArray = (
    items: any,
    itemsId: any,
    objPropName: any,
    newObjProp: any
) => {
    return items.map((u: any) => {
        if (u[objPropName] === itemsId) {
            return { ...u, ...newObjProp }
        }
        return u
    })
}
