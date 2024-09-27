import CheckBox from './CheckBox';
import React from 'react';
import { StudyRequirementObject } from 'src/modules/studies/ParticipationRequirement.slice';
import { colors, px, typography } from 'src/styles';
import styled from 'styled-components';


const StudyDataTypeGroupWrapper = styled.div`
  width: 100%;
  height: max-content;
  padding: ${px(15)} ${px(10)};
  border-radius: 5px;
  background-color: ${colors.blue15};
  margin-bottom: ${px(5)};
`
const GroupTypeListWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
`
const GroupTitleCheckBox = styled(CheckBox)`
  padding-bottom: ${px(10)};
  border-bottom: 2px solid ${colors.blue40};
  width: 100%;
  .group-data__title{
    ${typography.headingXSmall}
  }
`
const GroupTypeCheckBox = styled(CheckBox)`
  width: calc(50% - 15px);
`;
type Props = {
  groupTitle: keyof groupTitleObject;
  groupTypes: string[];
  onChangeDataType: (key: keyof StudyRequirementObject, value: unknown) => void;
  requirements: StudyRequirementObject
}
interface groupTitleObject {
  [key: string]: string;
}

const groupTitleMapping: groupTitleObject = {
  phonesensor: "Phone sensor",
  runestone: "Runestone",
  samsunghealth: "Samsung health",
  wear: "Wear",
  devicestat: "Devicestat"
}

const StudyDataTypeGroup: React.FC<Props> = ({groupTitle, groupTypes, onChangeDataType, requirements} : Props) => {
  const transformEventType = (eventType: string) => {
    const eventTypeArr = eventType.split("_");
    const res = eventTypeArr.map(evt => evt.charAt(0) + evt.substring(1, evt.length).toLowerCase()).join(" ");
    return res;
  }
  const handleClickCheckbox = (type : string) => {
    let newDataTypeList;
    if(requirements.healthDataTypeList.includes(type)) {
      newDataTypeList = requirements.healthDataTypeList.filter(dataType => dataType != type);
    }
    else {
      newDataTypeList = [...requirements.healthDataTypeList, type];
    }
    onChangeDataType("healthDataTypeList", newDataTypeList);
  }
  const isSelectAllByGroup = groupTypes.every(type => requirements.healthDataTypeList.includes(type));
  const isSelectSomeByGroup = groupTypes.some(type => 
    requirements.healthDataTypeList.includes(type));
  const handleSelectAllByGroup = () => {
    let newDataTypeList;
    if(isSelectAllByGroup) {
      newDataTypeList = requirements.healthDataTypeList.filter(dataType => !groupTypes.includes(dataType))
    }
    else {
      newDataTypeList = [...requirements.healthDataTypeList, ...groupTypes];
    }
    onChangeDataType("healthDataTypeList", newDataTypeList);
  }
  return (
    <StudyDataTypeGroupWrapper>
      <div>
        <GroupTitleCheckBox 
          checked={isSelectAllByGroup} 
          isSelectSome={isSelectSomeByGroup} 
          onChange={() => handleSelectAllByGroup()}
          data-testid='checkbox-all'
        >
          <span className='group-data__title'>{groupTitleMapping[groupTitle] || "Unknown"}</span>
          
        </GroupTitleCheckBox>
      </div>
      <GroupTypeListWrapper>
        {groupTypes.map(type => (
          <GroupTypeCheckBox 
            key={type}
            checked={requirements.healthDataTypeList.includes(type)} 
            onChange={() => handleClickCheckbox(type)}
          >
            {transformEventType(type)}
          </GroupTypeCheckBox>
        ))}
      </GroupTypeListWrapper>
    </StudyDataTypeGroupWrapper>
  );
};

export default StudyDataTypeGroup;
