import { CustomDataKeys, IChallengeData, IScore, ScoreKeys, ValidCondition } from "./types"


export function isScoreMetCondition(scoreData: IScore, challengeData: IChallengeData){
    console.log('score:', scoreData, 'challenge data:', challengeData)

    if(challengeData === null) { return false }
    
    let result = false
    for(let key in challengeData){
        result = false
        console.log(key, key in scoreData, scoreData[key as ScoreKeys], typeof scoreData[key as ScoreKeys])
        switch (key){
            case 'score':
            case 'level':
            case 'moves':
            case 'time':
            {
                if(key in scoreData && scoreData[key] !== undefined && scoreData[key] !== null && (typeof scoreData[key]) === 'number'){
                    result = checkCondition(challengeData[key].condition, scoreData[key], challengeData[key].target)
                    console.log('check condition result:', result)
                }
                else{
                    console.log('can not find key:', key)
                }
                break
            }
            case 'data':{
                if(key in scoreData && scoreData[key] !== undefined && scoreData[key] !== null){
                    let customKey = challengeData[key].customDataType as CustomDataKeys
                    if(customKey && scoreData.data && customKey in scoreData.data && scoreData[key][customKey]){
                        result = checkCondition(challengeData[key].condition, scoreData[key][customKey], challengeData[key].target)
                        console.log('check condition result:', result)
                    }
                    else{
                        console.log('can not find key:', customKey)
                    }
                }
                else{
                    console.log('can not find key:', key)
                }
                break
            }
            default:
                console.log('no score type key match', key)
                break
        }
        if(!result) return false
    }
    return true
}

function checkCondition(condition: ValidCondition, currentVal: number, targetVal: number){
    console.log('check condition:', condition, 'current val:', currentVal, 'target val:', targetVal)
    switch(condition){
        case '=':
            if(currentVal === targetVal) return true
            break
        
        case '<':
            if(currentVal < targetVal) return true
            break
        
        case '>':
            if(currentVal > targetVal) return true
            break
            
        case '<=':
            if(currentVal <= targetVal) return true
            break
        
        case '>=':
            if(currentVal >= targetVal) return true
            break
    }
    return false
}
