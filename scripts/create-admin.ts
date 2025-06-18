import {auth} from "@/lib/auth";
import {doesUserExist} from "@/lib/users/user-queries";
import {DEFAULT_ADMIN} from "@/constants";

export async function createSystemAdmin() {
    console.log('Checking for system admin user...');
    try{
            if(true){
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

