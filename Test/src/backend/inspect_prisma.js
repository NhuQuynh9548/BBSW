const { Prisma } = require('@prisma/client');

console.log('Inspecting Prisma PaymentMethod model definition...');
try {
    const dmmf = Prisma.dmmf;
    const model = dmmf.datamodel.models.find(m => m.name === 'PaymentMethod');

    if (model) {
        console.log('Fields found in PaymentMethod model:');
        model.fields.forEach(f => {
            console.log(`- ${f.name} (${f.type})`);
        });

        const missingFields = ['code', 'type', 'accountInfo', 'status'].filter(
            field => !model.fields.some(f => f.name === field)
        );

        if (missingFields.length > 0) {
            console.log('\n❌ MISSING FIELDS in Prisma client:', missingFields.join(', '));
            console.log('You need to run: npx prisma generate');
        } else {
            console.log('\n✅ All required fields are present in Prisma client.');
        }
    } else {
        console.log('❌ PaymentMethod model not found in Prisma client!');
    }
} catch (error) {
    console.error('Error inspecting Prisma client:', error);
}
