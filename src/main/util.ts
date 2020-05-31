import * as bcrypt from 'bcrypt'

export class Util {
    static async hashPassword(password: string) {
        return await bcrypt.hash(password, 10)
    }
    static async validatePassword(
        plainPassword: string,
        hashedPassword: string
    ) {
        return await bcrypt.compare(plainPassword, hashedPassword)
    }

    static getFileName(contentFile: any) {
        const unixTimestamp = Math.floor(new Date().getTime() / 1000)
        let fileName = contentFile.name
        fileName = fileName.replace(/ /g, '_')
        fileName = unixTimestamp + '_' + fileName
        return fileName
    }

    public static is(fn: Function, dv: any) {
        try {
            if (fn()) {
                return fn()
            } else {
                return dv
            }
        } catch (e) {
            return dv
        }
    }
}
