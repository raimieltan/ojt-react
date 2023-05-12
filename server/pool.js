import pg from 'pg'

const connectToDatabase = () => {
    const pool = new pg.Pool({
        user: 'postgres',
        password: 'postgres',
        database: 'ojt',
        host: 'localhost'
    })

    return pool
}

export { connectToDatabase }