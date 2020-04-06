import React, { useEffect, useState } from 'react';
import { Button, Card, CardActions, CardContent, Typography } from '@material-ui/core'

const Need = props => {

    const [need, setNeed] = useState(props);

    useEffect(() => {
        setNeed(props);
      }, [props]);

    return (
        <div>
            <Card variant="outlined">
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                    Community Need
                    </Typography>
                    <Typography >
                        Name: {need.needingUser.name}
                    </Typography>
                    <Typography color="textSecondary">
                        Need: {need.need}
                    </Typography>
                </CardContent>
                <CardActions>
                    {/* TODO: this needs to open a modal to collect data */}
                    <Button size="small">I can fulfill this need</Button>
                </CardActions>
                </Card>
        </div>
    )
};
export default Need;