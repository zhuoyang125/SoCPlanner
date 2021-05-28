const mongodb = require("mongodb")

let sample

class sampleDAO {
    static async injectdb(conn) {
        if (sample) {
            return;
        }
        try {
            sample = await conn.db("socplanner").collection("studyplan");
        } catch (e) {
            console.error(
                `Unable to establish a collection handle in SampleDAO ${e}`
            )
        }
    }

    static async getPlan({
        filters = null,
        page = 0,
        plansPerPage = 5
    } = {})
    {
        let query
        if (filters) {
            if (filters.major == "computer science") {
                if ("specialisation" in filters) {
                     query = {"specialisation": {$eq: filters["specialisation"]}}
                }
                else {
                     query = {"major": {$eq: filters["major"]}}
                }
            }
            else if ("major" in filters) {
                query = {"major": {$eq: filters["major"]}}
            }
        }

        let cursor

        try {
            cursor = await sample.find(query);
        } catch (e) {
            console.error(`Unable to issue find command, ${e}`)
            return {planList: []}
        }

        const displayCursor = cursor.limit(plansPerPage).skip(plansPerPage * page);
        
        try {
            const planList = await displayCursor.toArray();
            const totalNumPlans = await sample.countDocuments(query);
            return { planList, totalNumPlans };
        } catch (e) {
            console.error(
                `Unable to convert cursor to array or problem counting documents ${e}`
            )
            return {planList: [], totalNumPlans: 0}
        }
    }

    static async addPlan(plan) {
        try {
            return await sample.insertOne(plan)
        } catch (e) {
            console.error(`error inserting the plan ${e}`);
            return {error: e}
        }
    }
}

module.exports = sampleDAO