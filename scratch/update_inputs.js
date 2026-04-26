const fs = require('fs');
let content = fs.readFileSync('src/app/(portal)/apply/[courseId]/client-form.tsx', 'utf8');
const names = ['full_name', 'dob', 'father_name', 'mother_name', 'mother_mobile', 'guardian_name', 'guardian_relation', 'guardian_mobile', 'house_name', 'place', 'post_office', 'whatsapp_number', 'madrasa_qualification', 'last_school_name', 'sslc_hse_reg_number', 'remarks'];

names.forEach(name => {
  const regex = new RegExp('<Input (.*?)name="' + name + '"(.*?)className="(.*?)" />', 'g');
  content = content.replace(regex, '<Input $1name="' + name + '"$2defaultValue={initialData?.' + name + ' || ""} className="$3" />');
});
fs.writeFileSync('src/app/(portal)/apply/[courseId]/client-form.tsx', content);
console.log('Inputs updated!');
