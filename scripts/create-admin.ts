import {auth} from "@/lib/auth";
import {DEFAULT_ADMIN} from "@/constants";
import {db} from "@/lib/db";

export async function createSystemAdmin() {
    console.log('Checking for system admin user...');
    //check with prisma if user exists
    const user = await db.user.findUnique({
        where: {
            email: DEFAULT_ADMIN.email
        }
    });
    console.log(user);
    
    try{
            if(user===null){
                console.log(`Creating system admin user: ${DEFAULT_ADMIN.email}`);
                await auth.api.createUser({
                    body: {
                        email: DEFAULT_ADMIN.email,
                        password: DEFAULT_ADMIN.password,
                        role: 'admin',
                        name: 'System Administrator',
                    }
                });
                console.log(`System admin created successfully: ${DEFAULT_ADMIN.email}`);
                return;

            }
            else{
                console.log(`System admin already exists: ${DEFAULT_ADMIN.email}`);
                return;
            }
    }
    catch (error) {
        console.error('Error creating system admin:', error);
        throw error;
    }
}


if(require.main === module){
    createSystemAdmin()
        .then(() => {
            console.log('Admin setup complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Admin setup failed:', error);
            process.exit(1);
        });
}

