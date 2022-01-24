function getPostData(req) {
    return new Promise((resolve, reject) => {
        try {
            let body = ''
            req.on('data', chunk => {
                body += chunk.toString()
            })
    
            req.on('end', () => {
                resolve(body)
            })
    
        } catch (error) {
            reject(error)
        }
    })
}

function parseCookies(req) {
    return req.headers.cookie.split('; ').map(el => {
        const elem = el.split('=')
        return {[elem[0]]: elem[1]}
    }).reduce((prev, curr) => {return {...prev, ...curr}})
}

function authorized(id, data) {
    return Number(data.userId) === id && data.authorized === 'true'
}

module.exports = {
    getPostData,
    parseCookies,
    authorized
}