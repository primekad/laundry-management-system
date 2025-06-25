import {betterAuth, BetterAuthOptions} from "better-auth";
import {prismaAdapter} from "better-auth/adapters/prisma";
import {db} from "@/lib/db";
import {admin, customSession} from "better-auth/plugins";
import {
    ac,
    admin as adminRole,
    manager,
    staff,
} from './auth/permissions';
import {nextCookies} from "better-auth/next-js";
import sendEmail from "@/lib/email-api/send-email";


export function getBetterAuthOptions() {
    const options = {
        database: prismaAdapter(db, {
            provider: 'postgresql',
        }) as any,
        user: {
            additionalFields: {
                role: {
                    type: "string",
                    input: false,
                },
                assignedBranches: {
                    type: "string",
                    input: false,
                },
                defaultBranch: {
                    type: "string",
                    input: false,
                }
            }
        },
        emailAndPassword: {
            enabled: true,
            sendResetPassword: async ({user, url, token}: {
                user: { email: string; [key: string]: any };
                url: string;
                token: string
            }) => {
                await sendEmail({
                    to: user.email,
                    subject: "Reset your password",
                    html: `<p>Click the link to reset your password: ${url}</p>`,
                });
            }
        },
        plugins: [
            admin({
                ac,
                roles: {
                    admin: adminRole,
                    manager,
                    staff,
                },
            }),
            nextCookies(),
        ],
    } satisfies BetterAuthOptions;

    return {
        ...options,
        plugins: [
            ...(options.plugins ?? []),
            customSession(async ({user, session}) => {
                if (!user) {
                    return {user, session};
                }

                const userWithBranches = await db.user.findUnique({
                    where: {id: user.id},
                    include: {
                        assignedBranches: true,
                        defaultBranch: true,
                    },
                });

                return {
                    session, // The original session object
                    user: {
                        ...user,
                        // We are adding branch info to the user object within the session
                        assignedBranches: JSON.stringify(
                            userWithBranches?.assignedBranches || [],
                        ),
                        defaultBranch: JSON.stringify(
                            userWithBranches?.defaultBranch || null,
                        ),
                    },
                };
            }, options),

        ],
    };
}

export const auth = betterAuth(getBetterAuthOptions());
